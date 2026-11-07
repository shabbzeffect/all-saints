/* ParishFinance - SaintsHub Parish Portal
 * Tithes, offerings and donations: totals, history and record-donation form
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HandCoins } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { formatCurrency } from "@/lib/config"

interface Donation {
  id: string
  payerName: string
  payerPhone?: string
  description?: string
  amount: number
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  createdAt: string
  metadata?: { paymentMethod?: string; receiptNumber?: string }
  referenceNumber?: string
}

const STATUS_VARIANT: Record<Donation["status"], "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
}

export function ParishFinance() {
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  const [donorName, setDonorName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/shared/payments?type=PARISH_OFFERING", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      setDonations(body?.data ?? [])
    } catch {
      setDonations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const visible = donations.filter((donation) => {
    if (status && donation.status !== status) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const receipt = donation.metadata?.receiptNumber ?? donation.referenceNumber ?? ""
      if (!donation.payerName.toLowerCase().includes(q) && !receipt.toLowerCase().includes(q)) return false
    }
    return true
  })

  const completed = donations.filter((d) => d.status === "COMPLETED")
  const totalReceived = completed.reduce((sum, d) => sum + d.amount, 0)
  const pendingTotal = donations.filter((d) => d.status === "PENDING").reduce((sum, d) => sum + d.amount, 0)

  const handleRecordDonation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/shared/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PARISH_OFFERING",
          payerName: donorName,
          description: description || "Donation",
          amount: Number(amount) || 0,
          currency: "KES",
        }),
      })
      setMessage(res.ok ? "Donation recorded." : "Could not record donation.")
      if (res.ok) {
        setDonorName("")
        setAmount("")
        setDescription("")
        fetchDonations()
      }
    } catch {
      setMessage("Could not record donation.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Parish Finance</h2>
        <p className="text-sm text-muted-foreground">Tithes, offerings and donations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Received</p>
          <p className="mt-1 text-2xl font-bold text-anglican-green-700">{formatCurrency(totalReceived)}</p>
          <p className="text-xs text-muted-foreground">{completed.length} completed gifts</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-bold text-anglican-gold-600">{formatCurrency(pendingTotal)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Records</p>
          <p className="mt-1 text-2xl font-bold">{donations.length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Donation History</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search donor or receipt…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search donations"
            />
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
                <TableHead>Donor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Method</TableHead>
                <TableHead className="text-center">Receipt</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    <div className="font-medium">{donation.payerName}</div>
                    {donation.payerPhone && <div className="text-xs text-muted-foreground">{donation.payerPhone}</div>}
                  </TableCell>
                  <TableCell className="max-w-48"><span className="line-clamp-1 text-sm">{donation.description ?? "—"}</span></TableCell>
                  <TableCell className="text-center text-xs">{donation.metadata?.paymentMethod ?? "—"}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{donation.metadata?.receiptNumber ?? donation.referenceNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(donation.amount)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[donation.status] ?? "secondary"} size="sm">{donation.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{new Date(donation.createdAt).toLocaleDateString("en-KE")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No donations recorded yet.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading donations…</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HandCoins className="h-5 w-5" /> Record Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecordDonation} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="donorName" className="mb-1 block text-xs font-medium text-muted-foreground">Donor Name</label>
              <Input id="donorName" name="donorName" value={donorName} onValueChange={setDonorName} placeholder="Full name or 'Anonymous'" required />
            </div>
            <div>
              <label htmlFor="amount" className="mb-1 block text-xs font-medium text-muted-foreground">Amount (KES)</label>
              <Input id="amount" name="amount" type="number" min={1} value={amount} onValueChange={setAmount} placeholder="0" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
              <Input id="description" name="description" value={description} onValueChange={setDescription} placeholder="e.g. Sunday offering, building fund" />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={saving} loading={saving}>
                {saving ? "Saving…" : "Record Donation"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
