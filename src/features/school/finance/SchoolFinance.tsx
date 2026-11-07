/* School Finance - SaintsHub School Portal
 * Provides: Fee structure overview, payment history, record-payment form
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

interface FeeStructure {
  id: string
  name: string
  amount: number
  frequency: "ONCE" | "TERMLY" | "ANNUAL" | "MONTHLY"
  isMandatory: boolean
  applicableGrades: string[]
}

interface FeePayment {
  id: string
  studentName: string
  admissionNumber: string
  amount: number
  paymentMethod: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
  paymentDate: string
  receiptNumber: string
  status: "PENDING" | "COMPLETED" | "FAILED"
}

const PAYMENT_STATUS_VARIANT: Record<FeePayment["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
}

export function SchoolFinance() {
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [loading, setLoading] = useState(true)

  const [recordAdmission, setRecordAdmission] = useState("")
  const [recordAmount, setRecordAmount] = useState("")
  const [recordMethod, setRecordMethod] = useState("MPESA_STK_PUSH")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [feeRes, paymentRes] = await Promise.all([
        fetch("/api/school/finance", { cache: "no-store" }),
        fetch("/api/school/finance/payments", { cache: "no-store" }),
      ])
      const feeBody = await feeRes.json().catch(() => null)
      const paymentBody = await paymentRes.json().catch(() => null)
      setFeeStructure(feeBody?.data?.feeStructure ?? feeBody?.data ?? [])
      setPayments(paymentBody?.data ?? [])
    } catch {
      setFeeStructure([])
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const visiblePayments = payments.filter((payment) => {
    if (status && payment.status !== status) return false
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
    try {
      const res = await fetch("/api/school/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNumber: recordAdmission,
          amount: Number(recordAmount),
          paymentMethod: recordMethod,
        }),
      })
      setMessage(res.ok ? "Payment recorded." : "Could not record payment.")
      if (res.ok) {
        setRecordAdmission("")
        setRecordAmount("")
        fetchAll()
      }
    } catch {
      setMessage("Could not record payment.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">School Finance</h2>
        <p className="text-sm text-muted-foreground">Fee structure, payments and collections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Frequency</TableHead>
                <TableHead className="text-center">Mandatory</TableHead>
                <TableHead>Grades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructure.map((fs) => (
                <TableRow key={fs.id}>
                  <TableCell className="font-medium">{fs.name}</TableCell>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payment History</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search student, admission no or receipt…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-64"
              aria-label="Search payments"
            />
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
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
                  <TableCell className="text-center">{payment.paymentMethod}</TableCell>
                  <TableCell className="text-center">
                    <div className="font-medium">{payment.receiptNumber}</div>
                    <div className="text-xs text-muted-foreground">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={PAYMENT_STATUS_VARIANT[payment.status] ?? "secondary"} size="sm">
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visiblePayments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No payments found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading payments…</p>}
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
              <Input id="admissionNumber" name="admissionNumber" value={recordAdmission} onValueChange={setRecordAdmission} placeholder="e.g. STD-2024-001" required />
            </div>
            <div>
              <label htmlFor="amount" className="mb-1 block text-xs font-medium text-muted-foreground">Amount (KES)</label>
              <Input id="amount" name="amount" type="number" min={1} value={recordAmount} onValueChange={setRecordAmount} placeholder="0" required />
            </div>
            <div>
              <label htmlFor="paymentMethod" className="mb-1 block text-xs font-medium text-muted-foreground">Payment Method</label>
              <Select onValueChange={(e) => setRecordMethod(e.target.value)} defaultValue="MPESA_STK_PUSH" name="paymentMethod">
                <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MPESA_STK_PUSH">M-Pesa STK Push</SelectItem>
                  <SelectItem value="BANK_DEPOSIT">Bank Deposit</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={saving} loading={saving}>
                {saving ? "Recording…" : "Record Payment"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
