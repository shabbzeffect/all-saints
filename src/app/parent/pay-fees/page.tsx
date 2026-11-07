"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { CheckCircle2, Smartphone } from "lucide-react"
import { useState } from "react"
import { SAMPLE_CHILDREN } from "@/features/parent/sample-children"

interface FeeInvoice {
  id: string
  studentId: string
  description: string
  amount: number
  dueDate: string
  status: "OUTSTANDING" | "PAID"
}

const INITIAL_INVOICES: FeeInvoice[] = SAMPLE_CHILDREN.flatMap((child) =>
  child.feeBalance > 0
    ? [
        {
          id: `inv-${child.id}`,
          studentId: child.id,
          description: `Term 2 fees — ${child.fullName}`,
          amount: child.feeBalance,
          dueDate: "2026-11-30",
          status: "OUTSTANDING" as const,
        },
      ]
    : []
)

export default function PayFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>(INITIAL_INVOICES)
  const [selectedId, setSelectedId] = useState<string>(INITIAL_INVOICES[0]?.id ?? "")
  const [phone, setPhone] = useState("")
  const [method, setMethod] = useState("mpesa")
  const [paying, setPaying] = useState(false)
  const [receipt, setReceipt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selected = invoices.find((i) => i.id === selectedId)
  const outstanding = invoices.filter((i) => i.status === "OUTSTANDING")
  const totalOutstanding = outstanding.reduce((sum, i) => sum + i.amount, 0)

  const childName = (studentId: string) =>
    SAMPLE_CHILDREN.find((c) => c.id === studentId)?.fullName ?? "Student"

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected) return
    setPaying(true)
    setError(null)
    try {
      const res = await fetch("/api/parent/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: "inst-school-1",
          invoiceId: selected.id,
          paymentType: method === "mpesa" ? "mpesa" : "bank",
          mpesaCallbackBody: { Amount: selected.amount, CustomerMSISDN: phone },
          processedBy: "Parent",
        }),
      })
      const body = await res.json().catch(() => null)
      if (res.ok && body?.payment?.receiptNumber) {
        setReceipt(body.payment.receiptNumber)
        setInvoices((prev) =>
          prev.map((i) => (i.id === selected.id ? { ...i, status: "PAID" } : i))
        )
      } else {
        setError("Payment could not be initiated. Please try again or contact the bursar.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Pay Fees</h2>
        <p className="text-sm text-muted-foreground">Settle outstanding school fees for your children</p>
      </div>

      {receipt && (
        <div className="flex items-start gap-3 rounded-xl border border-anglican-green-300 bg-anglican-green-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-anglican-green-700" />
          <div>
            <p className="font-semibold text-anglican-green-900">Payment initiated successfully</p>
            <p className="text-sm text-anglican-green-800">
              Receipt <span className="font-mono font-semibold">{receipt}</span> — an STK push has been sent to your phone. Complete the payment on your handset.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                  <TableRow
                    key={invoice.id}
                    className={invoice.id === selectedId ? "bg-anglican-blue-50/50" : undefined}
                    onClick={() => setSelectedId(invoice.id)}
                  >
                    <TableCell className="font-medium">{childName(invoice.studentId)}</TableCell>
                    <TableCell className="text-sm">{invoice.description}</TableCell>
                    <TableCell className="text-right font-medium">KSh {invoice.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-sm">{new Date(invoice.dueDate).toLocaleDateString("en-KE")}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={invoice.status === "PAID" ? "success" : "warning"} size="sm">{invoice.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total outstanding</span>
              <span className="text-lg font-bold text-destructive">KSh {totalOutstanding.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> Pay with M-Pesa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label htmlFor="invoice" className="mb-1 block text-xs font-medium text-muted-foreground">Invoice</label>
                <Select onValueChange={(e) => setSelectedId(e.target.value)} defaultValue={selectedId} name="invoice">
                  <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                  <SelectContent>
                    {invoices.filter((i) => i.status === "OUTSTANDING").map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {childName(i.studentId)} — KSh {i.amount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Payment Method</span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {[
                    { id: "mpesa", label: "M-Pesa STK" },
                    { id: "bank", label: "Bank Transfer" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMethod(opt.id)}
                      aria-pressed={method === opt.id}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        method === opt.id
                          ? "border-anglican-blue-500 bg-anglican-blue-50 text-anglican-blue-900"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-xs font-medium text-muted-foreground">M-Pesa Phone Number</label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onValueChange={setPhone}
                  placeholder="e.g. 0712 345 678"
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={paying || !selected} loading={paying}>
                {paying ? "Sending STK push…" : `Pay KSh ${selected?.amount.toLocaleString() ?? 0}`}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
