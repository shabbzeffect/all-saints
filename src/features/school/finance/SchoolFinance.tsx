/* School Finance - SaintsHub School Portal
 * Fee structure, collection stats, payment history and record-payment form.
 * Data comes from /api/school/finance and /api/school/finance/payments (live DB).
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/config"
import { useState, useEffect, useCallback } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface FeeStructure {
  id: string
  name: string
  description: string
  amount: number
  frequency: "ONCE" | "TERMLY" | "ANNUAL" | "MONTHLY"
  isMandatory: boolean
  applicableGrades: string[]
}

interface FinanceStats {
  invoiced: number
  collected: number
  outstanding: number
  remainingNet: number
  overdueStudents: number
}

interface Arrear {
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  outstanding: number
  invoiceCount: number
  earliestDueDate: string | null
}

interface FeePayment {
  id: string
  studentName: string
  admissionNumber: string
  amount: number
  paymentMethod: "CASH" | "MPESA" | "BANK_TRANSFER" | "CHEQUE" | "CARD" | "WALLET" | "ONLINE" | "IN_KIND"
  paymentDate: string
  receiptNumber: string
  status: "COMPLETED"
}

const METHOD_LABEL: Record<FeePayment["paymentMethod"], string> = {
  CASH: "Cash",
  MPESA: "M-Pesa",
  BANK_TRANSFER: "Bank",
  CHEQUE: "Cheque",
  CARD: "Card",
  WALLET: "Wallet",
  ONLINE: "Online",
  IN_KIND: "In kind",
}

async function readApi(res: Response): Promise<any> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export function SchoolFinance() {
  const [method, setMethod] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [arrearSearch, setArrearSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState("")
  const [arrears, setArrears] = useState<Arrear[]>([])
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([])
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [loading, setLoading] = useState(true)

  const [recordAdmission, setRecordAdmission] = useState("")
  const [recordAmount, setRecordAmount] = useState("")
  const [recordMethod, setRecordMethod] = useState<FeePayment["paymentMethod"]>("CASH")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [feeRes, paymentRes, arrearsRes] = await Promise.all([
        fetch("/api/school/finance", { cache: "no-store" }),
        fetch("/api/school/finance/payments", { cache: "no-store" }),
        fetch("/api/school/finance/arrears", { cache: "no-store" }),
      ])
      const feeBody = await readApi(feeRes)
      const paymentBody = await readApi(paymentRes)
      const arrearsBody = await readApi(arrearsRes)
      setFeeStructure(feeBody?.data?.feeStructure ?? [])
      setStats(feeBody?.data?.stats ?? null)
      setPayments(paymentBody?.data ?? [])
      setArrears(arrearsBody?.data?.arrears ?? [])
    } catch {
      setFeeStructure([])
      setStats(null)
      setPayments([])
      setArrears([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const arrearGrades = [...new Set(arrears.map((a) => a.grade))].sort()
  const visibleArrears = arrears.filter((a) => {
    if (gradeFilter && a.grade !== gradeFilter) return false
    if (arrearSearch) {
      const q = arrearSearch.toLowerCase()
      if (
        !a.studentName.toLowerCase().includes(q) &&
        !a.admissionNumber.toLowerCase().includes(q) &&
        !a.grade.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })
  const visibleArrearsTotal = visibleArrears.reduce((sum, a) => sum + a.outstanding, 0)

  const visiblePayments = payments.filter((payment) => {
    if (method && payment.paymentMethod !== method) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (
        !payment.studentName.toLowerCase().includes(q) &&
        !payment.admissionNumber.toLowerCase().includes(q) &&
        !payment.receiptNumber.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/school/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNumber: recordAdmission.trim(),
          amount: Number(recordAmount),
          paymentMethod: recordMethod,
        }),
      })
      const body = await readApi(res)
      if (res.ok && body?.success) {
        setMessage(`Payment recorded — receipt ${body.data?.receiptNumber ?? "issued"}.`)
        setRecordAdmission("")
        setRecordAmount("")
        setRecordMethod("CASH")
        fetchAll()
      } else {
        setError(body?.error ?? "Could not record payment.")
      }
    } catch {
      setError("Could not record payment.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">School Finance</h2>
        <p className="text-sm text-muted-foreground">Fee structures, collections and receipts — all figures from the live ledger</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoiced (2026)</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.invoiced)}</p>
            <p className="text-xs text-muted-foreground">annual fees billed across all grades</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Collected</p>
            <p className="mt-1 text-2xl font-bold text-anglican-green-700">{formatCurrency(stats.collected)}</p>
            <p className="text-xs text-muted-foreground">all payments received to date</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{formatCurrency(stats.outstanding)}</p>
            <p className="text-xs text-muted-foreground">{stats.overdueStudents} learner{stats.overdueStudents === 1 ? "" : "s"} with arrears</p>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Arrears <span className="text-sm font-normal text-muted-foreground">({visibleArrears.length} learner{visibleArrears.length === 1 ? "" : "s"} with balances)</span></CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search student, admission no or grade…"
              value={arrearSearch}
              onValueChange={setArrearSearch}
              className="w-full sm:w-64"
              aria-label="Search arrears"
            />
            <Select onValueChange={(e) => setGradeFilter(e.target.value)} defaultValue="" name="grade" aria-label="Filter by grade">
              <SelectTrigger><SelectValue placeholder="All grades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All grades</SelectItem>
                {arrearGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Invoices</TableHead>
                <TableHead className="text-center">Earliest due</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleArrears.map((a) => (
                <TableRow key={a.studentId}>
                  <TableCell>
                    <div className="font-medium">{a.studentName}</div>
                    <div className="text-xs text-muted-foreground">{a.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-center">{a.grade}</TableCell>
                  <TableCell className="text-center">{a.invoiceCount}</TableCell>
                  <TableCell className="text-center text-sm">{a.earliestDueDate ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">{formatCurrency(a.outstanding)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visibleArrears.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No learners with arrears.</p>
          )}
          {!loading && visibleArrears.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total outstanding (filtered)</span>
              <span className="text-lg font-bold text-destructive">{formatCurrency(visibleArrearsTotal)}</span>
            </div>
          )}
          {loading && <TableSkeleton columns={5} rows={6} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structure — 2026</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Amount / yr</TableHead>
                <TableHead className="text-center">Frequency</TableHead>
                <TableHead className="text-center">Mandatory</TableHead>
                <TableHead>Grades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructure.map((fs) => (
                <TableRow key={fs.id}>
                  <TableCell>
                    <div className="font-medium">{fs.name}</div>
                    <div className="text-xs text-muted-foreground">{fs.description}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(fs.amount)}</TableCell>
                  <TableCell className="text-center">{fs.frequency}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={fs.isMandatory ? "primary" : "secondary"} size="sm">
                      {fs.isMandatory ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {fs.applicableGrades.length > 0 ? fs.applicableGrades.join(", ") : "All grades"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && feeStructure.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No fee structure configured yet.</p>
          )}
          {loading && <TableSkeleton columns={5} rows={6} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payment History <span className="text-sm font-normal text-muted-foreground">(latest 100)</span></CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search student, admission no or receipt…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-64"
              aria-label="Search payments"
            />
            <Select onValueChange={(e) => setMethod(e.target.value)} defaultValue="" name="method" aria-label="Filter by method">
              <SelectTrigger><SelectValue placeholder="All methods" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="MPESA">M-Pesa</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="IN_KIND">In kind</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Method</TableHead>
                <TableHead className="text-center">Receipt</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">{payment.studentName}</div>
                    <div className="text-xs text-muted-foreground">{payment.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-center">{METHOD_LABEL[payment.paymentMethod] ?? payment.paymentMethod}</TableCell>
                  <TableCell className="text-center">
                    <div className="font-medium">{payment.receiptNumber}</div>
                    <div className="text-xs text-muted-foreground">{new Date(payment.paymentDate).toLocaleDateString("en-KE")}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="success" size="sm">{payment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visiblePayments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No payments found.</p>
          )}
          {loading && <TableSkeleton columns={5} rows={8} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecordPayment} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="admissionNumber" className="mb-1 block text-xs font-medium text-muted-foreground">Admission Number</label>
              <Input id="admissionNumber" name="admissionNumber" value={recordAdmission} onValueChange={setRecordAdmission} placeholder="e.g. 1251" required />
            </div>
            <div>
              <label htmlFor="amount" className="mb-1 block text-xs font-medium text-muted-foreground">Amount (KES)</label>
              <Input id="amount" name="amount" type="number" min={1} step="0.01" value={recordAmount} onValueChange={setRecordAmount} placeholder="0" required />
            </div>
            <div>
              <label htmlFor="paymentMethod" className="mb-1 block text-xs font-medium text-muted-foreground">Payment Method</label>
              <Select onValueChange={(e) => setRecordMethod(e.target.value as FeePayment["paymentMethod"])} defaultValue="CASH" name="paymentMethod">
                <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Deposit</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="IN_KIND">In kind</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={saving} loading={saving}>
                {saving ? "Recording…" : "Record Payment"}
              </Button>
            </div>
          </form>
          {message && <p className="mt-3 text-sm text-anglican-green-700">{message}</p>}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
