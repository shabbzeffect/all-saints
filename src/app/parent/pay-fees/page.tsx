"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, RefreshCw } from "lucide-react"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { useCallback, useEffect, useState } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface FeeInvoice {
  id: string
  studentId: string
  studentName: string
  description: string
  amount: number
  dueDate: string
  status: "OUTSTANDING" | "PAID"
}

export default function PayFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/parent/invoices", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.success) throw new Error(body?.error ?? "Request failed")
      setInvoices(body.data?.invoices ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalOutstanding = invoices.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Pay Fees</h2>
        <p className="text-sm text-muted-foreground">Settle outstanding school fees for your children</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading && <TableSkeleton columns={5} rows={4} />}
            {!loading && error && (
              <div className="py-6 text-center">
                <p className="font-medium text-destructive">Could not load invoices</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            )}
            {!loading && !error && invoices.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No outstanding invoices — thank you.</p>
            )}
            {!loading && !error && invoices.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Due</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.studentName}</TableCell>
                        <TableCell className="text-sm">{invoice.description}</TableCell>
                        <TableCell className="text-right font-medium">KSh {invoice.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-center text-sm">{new Date(invoice.dueDate).toLocaleDateString("en-KE")}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="warning" size="sm">{invoice.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Total outstanding</span>
                  <span className="text-lg font-bold text-destructive">KSh {totalOutstanding.toLocaleString()}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> Pay via M-Pesa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Online M-Pesa payment is not connected yet, so we cannot send an STK push from this page. Payments are handled at the school office until the M-Pesa link is live.
            </p>
            <p>
              To settle your balance now, please pay at the school office or contact the bursar directly, quoting the invoice number and your child’s name. You will receive a receipt you can present at the gate.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
