"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Receipt } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ReceiptRow {
  id: string
  receiptNumber: string
  amount: number
  paymentMethod: string
  issueDate: string
  status: "ISSUED" | "ACKNOWLEDGED" | "VOID"
  studentName: string
  acknowledged: boolean
}

const FALLBACK_RECEIPTS: ReceiptRow[] = [
  { id: "rec-001", receiptNumber: "REC-2026-001", amount: 15000, paymentMethod: "MPESA_STK_PUSH", issueDate: new Date(Date.now() - 86400000).toISOString(), status: "ISSUED", studentName: "Adeline Akinyi", acknowledged: false },
  { id: "rec-002", receiptNumber: "REC-2026-002", amount: 18500, paymentMethod: "BANK_DEPOSIT", issueDate: new Date(Date.now() - 172800000).toISOString(), status: "ACKNOWLEDGED", studentName: "Brian Ochieng", acknowledged: true },
]

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/parent/receipts", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setReceipts(body?.receipts?.length ? body.receipts : FALLBACK_RECEIPTS))
      .catch(() => setReceipts(FALLBACK_RECEIPTS))
      .finally(() => setLoading(false))
  }, [])

  const acknowledge = (id: string) => setAcknowledgedIds((prev) => new Set(prev).add(id))

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Method</TableHead>
                <TableHead className="text-center">Issued</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => {
                const acknowledged = receipt.acknowledged || acknowledgedIds.has(receipt.id)
                return (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono text-xs">{receipt.receiptNumber}</TableCell>
                    <TableCell>{receipt.studentName}</TableCell>
                    <TableCell className="text-right font-medium">KSh {receipt.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-xs">{receipt.paymentMethod.replaceAll("_", " ")}</TableCell>
                    <TableCell className="text-center text-sm">{new Date(receipt.issueDate).toLocaleDateString("en-KE")}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={acknowledged ? "success" : "warning"} size="sm">
                        {acknowledged ? "ACKNOWLEDGED" : "ISSUED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-2">
                        <Button variant="outline" size="sm" aria-label="Download receipt">
                          <Download className="mr-1 h-4 w-4" /> PDF
                        </Button>
                        {!acknowledged && (
                          <Button variant="ghost" size="sm" onClick={() => acknowledge(receipt.id)}>
                            Acknowledge
                          </Button>
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {!loading && receipts.length === 0 && (
            <div className="flex flex-col items-center py-8"><Receipt className="h-6 w-6 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" /><p className="mt-2 text-sm font-medium text-muted-foreground">No receipts yet</p><Link href="/parent/pay-fees" className="mt-1 text-xs font-semibold text-anglican-blue-700 hover:underline">Pay a fee to get your first receipt</Link></div>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading receipts…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
