"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Printer, Receipt, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface ReceiptRow {
  id: string
  receiptNumber: string
  amount: number
  paymentMethod: string
  issueDate: string
  studentName: string
  admissionNumber: string
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/parent/receipts", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.success) throw new Error(body?.error ?? "Request failed")
      setReceipts(body.data?.receipts ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load receipts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Receipts</h2>
        <p className="text-sm text-muted-foreground">Payment receipts for your children&rsquo;s fees</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> {receipts.length} Receipts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading && <TableSkeleton columns={6} rows={5} />}
          {!loading && error && (
            <div className="py-6 text-center">
              <p className="font-medium text-destructive">Could not load receipts</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Method</TableHead>
                    <TableHead className="text-center">Issued</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono text-xs">{receipt.receiptNumber}</TableCell>
                      <TableCell>{receipt.studentName}</TableCell>
                      <TableCell className="text-right font-medium">KSh {receipt.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-xs">{receipt.paymentMethod.replaceAll("_", " ")}</TableCell>
                      <TableCell className="text-center text-sm">{new Date(receipt.issueDate).toLocaleDateString("en-KE")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => window.print()} aria-label="Print receipt">
                          <Printer className="mr-1 h-4 w-4" /> Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {receipts.length === 0 && (
                <div className="flex flex-col items-center py-8"><Receipt className="h-6 w-6 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" /><p className="mt-2 text-sm font-medium text-muted-foreground">No receipts yet</p><Link href="/parent/pay-fees" className="mt-1 text-xs font-semibold text-anglican-blue-700 hover:underline">Pay a fee to get your first receipt</Link></div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
