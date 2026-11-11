/* MyPayslips - SaintsHub HR Module
 * Staff self-service: your own finalized payslips, printable on demand.
 * DRAFT payslips are never shown — they appear here once the run is finalized.
 */
"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"
import { formatCurrency } from "@/lib/config"
import { PayslipDocument, type PayslipDocumentData } from "./PayslipDocument"

interface MyPayslip extends PayslipDocumentData {
  run: { period: string; status: string }
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function periodLabel(period: string) {
  const [y, m] = period.split("-").map((n) => parseInt(n, 10))
  if (!y || !m || m < 1 || m > 12) return period
  return `${MONTHS[m - 1]} ${y}`
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })

export function MyPayslips() {
  const [payslips, setPayslips] = useState<MyPayslip[]>([])
  const [institutionName, setInstitutionName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null)
  const [selected, setSelected] = useState<MyPayslip | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hr/payroll/mine", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Could not load your payslips" })
        setPayslips([])
        return
      }
      setPayslips(body?.data?.payslips ?? [])
      setInstitutionName(body?.data?.institutionName ?? null)
    } catch {
      setMessage({ tone: "error", text: "Could not load your payslips" })
      setPayslips([])
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
        <h2 className="text-xl font-bold">My payslips</h2>
        <p className="text-sm text-muted-foreground">
          Your finalized payslips{institutionName ? ` — ${institutionName}` : ""}. Print or save a PDF of any month.
          Only payslips from a finalized payroll run appear here.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-md border px-4 py-2 text-sm ${
            message.tone === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-anglican-green-700/30 bg-anglican-green-700/10 text-anglican-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-anglican-blue-700" aria-hidden="true" />
            Payslips on file
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <TableSkeleton columns={6} rows={4} className="py-3" />
          ) : payslips.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium">No finalized payslips yet</p>
              <p className="text-sm text-muted-foreground">Payslips appear here once a payroll run is finalized by HR.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net pay</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Payslip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell className="font-medium">{periodLabel(slip.run.period)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(slip.grossSalary)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(slip.totalDeductions)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(slip.netSalary)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success" size="sm">FINAL</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(slip)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Something looks wrong? Contact the Bursar before the next payroll run is finalized — changes after finalization
        have to go through a correction run.
      </p>

      {selected && (
        <PayslipDocument
          payslip={selected}
          periodLabel={periodLabel(selected.run.period)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
