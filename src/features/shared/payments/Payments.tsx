/* Payments - SaintsHub Admin
 * Cross-wing payment ledger: school fees, parish offerings, transport, boarding
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/config"

interface PaymentRow {
  id: string
  type: "SCHOOL_FEES" | "PARISH_OFFERING" | "TRANSPORT" | "BOARDING" | "OTHER"
  amount: number
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  payerName: string
  description?: string
  referenceNumber?: string
  createdAt: string
  metadata?: { paymentMethod?: string; receiptNumber?: string }
}

const TYPE_VARIANT: Record<PaymentRow["type"], "primary" | "secondary" | "info" | "warning" | "default"> = {
  SCHOOL_FEES: "primary",
  PARISH_OFFERING: "info",
  TRANSPORT: "warning",
  BOARDING: "secondary",
  OTHER: "default",
}

const STATUS_VARIANT: Record<PaymentRow["status"], "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
}

export function Payments() {
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (searchTerm) params.set("search", searchTerm)
    fetch(`/api/shared/payments${params.toString() ? `?${params}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setPayments(body?.data ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [type, status, searchTerm])

  const completed = payments.filter((p) => p.status === "COMPLETED")
  const totalCollected = completed.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Payments</h2>
        <p className="text-sm text-muted-foreground">Unified ledger across school and parish</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Collected</p>
          <p className="mt-1 text-2xl font-bold text-anglican-green-700">{formatCurrency(totalCollected)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed Transactions</p>
          <p className="mt-1 text-2xl font-bold">{completed.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Failed</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{payments.filter((p) => p.status === "FAILED").length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{payments.length} Payments</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search payer or reference…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search payments"
            />
            <Select onValueChange={(e) => setType(e.target.value)} defaultValue="" name="type" aria-label="Filter by type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="SCHOOL_FEES">School Fees</SelectItem>
                <SelectItem value="PARISH_OFFERING">Parish Offering</SelectItem>
                <SelectItem value="TRANSPORT">Transport</SelectItem>
                <SelectItem value="BOARDING">Boarding</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payer</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">{payment.payerName}</div>
                    {payment.description && <div className="line-clamp-1 text-xs text-muted-foreground">{payment.description}</div>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={TYPE_VARIANT[payment.type] ?? "secondary"} size="sm">{payment.type.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.referenceNumber ?? payment.metadata?.receiptNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[payment.status] ?? "secondary"} size="sm">{payment.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{new Date(payment.createdAt).toLocaleDateString("en-KE")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && payments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No payments found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading payments…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
