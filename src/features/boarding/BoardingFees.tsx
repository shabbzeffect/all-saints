/* BoardingFees - SaintsHub Boarding Module
 * Boarding fee billing: records, status filter, process-payment modal
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { formatCurrency } from "@/lib/config"
import { TableSkeleton } from "@/components/ui/skeleton"

interface BillingRecord {
  id: string
  studentId: string
  studentName: string
  studentAdmission: string
  feeName: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

const STATUS_VARIANT: Record<BillingRecord["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
}

export function BoardingFees() {
  const [billing, setBilling] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [paymentTarget, setPaymentTarget] = useState<BillingRecord | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [transactionId, setTransactionId] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchBilling = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/boarding/fees/billing", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      setBilling(body?.data ?? [])
    } catch {
      setBilling([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBilling()
  }, [fetchBilling])

  const visible = billing.filter((record) => {
    if (statusFilter && record.status !== statusFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (
        !record.studentName.toLowerCase().includes(q) &&
        !record.feeName.toLowerCase().includes(q) &&
        !record.receiptNumber?.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })

  const totalDue = billing
    .filter((b) => b.status === "PENDING" || b.status === "OVERDUE")
    .reduce((sum, b) => sum + b.amount, 0)

  const totalPaid = billing
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + b.amount, 0)

  const processPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!paymentTarget || !paymentMethod || !transactionId.trim()) return
    setProcessing(true)
    const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}`
    setBilling((prev) =>
      prev.map((b) =>
        b.id === paymentTarget.id
          ? { ...b, status: "PAID", paidDate: new Date().toISOString().slice(0, 10), paymentMethod, receiptNumber }
          : b
      )
    )
    setProcessing(false)
    setPaymentTarget(null)
    setTransactionId("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Boarding Fees</h2>
        <p className="text-sm text-muted-foreground">Boarding fee billing and payment history</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{formatCurrency(totalDue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Collected</p>
          <p className="mt-1 text-2xl font-bold text-anglican-green-700">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{billing.length} Billing Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search student, fee or receipt…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search billing records"
            />
            <Select onValueChange={(e) => setStatusFilter(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Period</TableHead>
                <TableHead className="text-center">Due Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium">{record.studentName}</div>
                    <div className="text-xs text-muted-foreground">{record.studentAdmission}</div>
                  </TableCell>
                  <TableCell>{record.feeName}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(record.amount)}</TableCell>
                  <TableCell className="text-center">{record.period}</TableCell>
                  <TableCell className="text-center">{record.dueDate}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[record.status] ?? "secondary"} size="sm">{record.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {record.status !== "PAID" ? (
                      <Button size="sm" variant="primary" onClick={() => setPaymentTarget(record)}>
                        Pay now
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Paid {record.paidDate}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No billing records found.</p>
          )}
          {loading && <TableSkeleton columns={6} rows={5} />}
        </CardContent>
      </Card>

      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={() => setPaymentTarget(null)} />
          <Card className="relative z-10 w-full max-w-md shadow-2xl">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Pay — {paymentTarget.studentName}</CardTitle>
              <button className="rounded-md p-1.5 hover:bg-accent" onClick={() => setPaymentTarget(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={processPayment} className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold">{formatCurrency(paymentTarget.amount)}</p>
                </div>
                <div>
                  <label htmlFor="paymentMethod" className="mb-1 block text-xs font-medium text-muted-foreground">Payment Method</label>
                  <Select onValueChange={(e) => setPaymentMethod(e.target.value)} defaultValue="mpesa" name="paymentMethod">
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa STK Push</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="transactionId" className="mb-1 block text-xs font-medium text-muted-foreground">Transaction ID</label>
                  <Input
                    id="transactionId"
                    name="transactionId"
                    value={transactionId}
                    onValueChange={setTransactionId}
                    placeholder="e.g. QHX2AB1234"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={processing} loading={processing}>
                  {processing ? "Processing…" : "Process Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
