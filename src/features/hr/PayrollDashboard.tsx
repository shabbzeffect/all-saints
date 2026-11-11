/* PayrollDashboard - SaintsHub HR Module
 * Kenya payroll runs: create & compute a month, review payslips, finalize or cancel.
 * Amounts in KES. Printable payslip view via window.print().
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Loader2, Printer, X, Banknote, Users, CalendarClock, FileText } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/config"
import { Settings, FileDown } from "lucide-react"

interface PayrollRunSummary {
  id: string
  period: string
  periodStart: string
  periodEnd: string
  payDate: string
  status: "DRAFT" | "COMPLETED" | "CANCELLED"
  staffCount: number
  totalGross: number
  totalDeductions: number
  totalNet: number
  totalEmployerCost: number
  finalizedAt: string | null
  _count?: { payslips: number }
}

interface PayslipLine {
  id: string
  description: string
  amount: number
  type: string // ALLOWANCE | DEDUCTION | EMPLOYER
  taxCategory: string | null
}

interface Payslip {
  id: string
  basicSalary: number
  grossSalary: number
  totalDeductions: number
  netSalary: number
  employerCost: number
  status: "DRAFT" | "FINAL" | "CANCELLED"
  payDate: string
  staff: {
    id: string
    user: { name: string | null; email: string | null }
    role: { name: string } | null
    employmentType: { name: string } | null
  }
  lines: PayslipLine[]
}

interface PayrollRunDetail extends PayrollRunSummary {
  payslips: Payslip[]
}

interface HrSummary {
  activeStaff: number
  estimatedMonthlyPayroll: number
  latestCompletedRun: { period: string; totalNet: number } | null
  draftRuns: number
}

const RUN_STATUS_VARIANT: Record<PayrollRunSummary["status"], "warning" | "success" | "secondary"> = {
  DRAFT: "warning",
  COMPLETED: "success",
  CANCELLED: "secondary",
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

export function PayrollDashboard() {
  const [runs, setRuns] = useState<PayrollRunSummary[]>([])
  const [hrSummary, setHrSummary] = useState<HrSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null)
  const [detail, setDetail] = useState<PayrollRunDetail | null>(null)
  const [payslipView, setPayslipView] = useState<Payslip | null>(null)
  const [allowances, setAllowances] = useState<Record<string, string>>({})

  const now = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [runsRes, summaryRes] = await Promise.all([
        fetch("/api/hr/payroll", { cache: "no-store" }),
        fetch("/api/hr/payroll?summary=1", { cache: "no-store" }),
      ])
      const runsBody = await runsRes.json().catch(() => null)
      const summaryBody = await summaryRes.json().catch(() => null)
      if (!runsRes.ok) {
        setMessage({ tone: "error", text: runsBody?.error ?? "You do not have access to payroll" })
      }
      setRuns(runsBody?.data ?? [])
      setHrSummary(summaryBody?.data ?? null)
    } catch {
      setRuns([])
      setHrSummary(null)
      setMessage({ tone: "error", text: "Could not load payroll data" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setAllowances({})
  }, [detail?.id])

  const openDetail = async (runId: string) => {
    setActionBusy(true)
    try {
      const res = await fetch(`/api/hr/payroll/${runId}`, { cache: "no-store" })
      const body = await res.json()
      if (res.ok) setDetail(body.data)
      else setMessage({ tone: "error", text: body?.error ?? "Failed to load run" })
    } finally {
      setActionBusy(false)
    }
  }

  const createRun = async () => {
    setCreating(true)
    setMessage(null)
    try {
      const res = await fetch("/api/hr/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: parseInt(month, 10), year: parseInt(year, 10) }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Failed to create payroll run" })
        return
      }
      setMessage({ tone: "info", text: body?.message ?? "Payroll run created" })
      await load()
      if (body?.data?.id) await openDetail(body.data.id)
    } finally {
      setCreating(false)
    }
  }

  const runAction = async (runId: string, action: "finalize" | "cancel" | "compute") => {
    if (action === "finalize" && !window.confirm("Finalize this run? Payslips become FINAL and cannot be edited.")) return
    if (action === "cancel" && !window.confirm("Cancel this run? All its payslips will be marked CANCELLED.")) return
    setActionBusy(true)
    setMessage(null)
    try {
      const adjustments =
        action === "compute"
          ? Object.entries(allowances)
              .map(([staffId, raw]) => ({ staffId, allowances: Math.max(0, Number(raw) || 0) }))
              .filter((a) => a.allowances > 0)
          : undefined
      const res = await fetch(`/api/hr/payroll/${runId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adjustments }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? `Failed to ${action} run` })
        return
      }
      setMessage({ tone: "info", text: body?.message ?? `Run ${action}d` })
      await load()
      await openDetail(runId)
    } finally {
      setActionBusy(false)
    }
  }

  const earnings = useMemo(
    () => payslipView?.lines.filter((l) => l.type === "ALLOWANCE") ?? [],
    [payslipView]
  )
  const deductions = useMemo(
    () => payslipView?.lines.filter((l) => l.type === "DEDUCTION") ?? [],
    [payslipView]
  )
  const employerLines = useMemo(
    () => payslipView?.lines.filter((l) => l.type === "EMPLOYER") ?? [],
    [payslipView]
  )
  const totalEarnings = useMemo(
    () => earnings.reduce((sum, l) => sum + l.amount, 0),
    [earnings]
  )

  const yearOptions = useMemo(() => {
    const y = now.getFullYear()
    return [y - 2, y - 1, y, y + 1]
  }, [now])
  const [p9Year, setP9Year] = useState(String(now.getFullYear()))

  return (
    <div className="space-y-6">
      {/* Header + metrics */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Payroll</h2>
          <p className="text-sm text-muted-foreground">
            Kenya statutory payroll — PAYE, NSSF, SHIF and Affordable Housing Levy. Create a run, review payslips, then finalize.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <Link
            href="/hr/payroll/loans"
            className="focus-ring inline-flex h-9 w-fit items-center gap-2 rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Banknote className="h-4 w-4" aria-hidden="true" />
            Loans
          </Link>
          <Link
            href="/hr/payroll/settings"
            className="focus-ring inline-flex h-9 w-fit items-center gap-2 rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Statutory settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active staff", value: String(hrSummary?.activeStaff ?? "—"), icon: Users, tone: "text-anglican-green-700" },
          { label: "Est. monthly payroll", value: hrSummary ? formatCurrency(hrSummary.estimatedMonthlyPayroll) : "—", icon: Banknote, tone: "text-anglican-blue-700" },
          { label: "Last finalized net", value: hrSummary?.latestCompletedRun ? formatCurrency(hrSummary.latestCompletedRun.totalNet) : "None", icon: CalendarClock, tone: "text-anglican-gold-600" },
          { label: "Draft runs", value: String(hrSummary?.draftRuns ?? 0), icon: FileText, tone: "text-destructive" },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className={`mt-1 truncate text-lg font-bold sm:text-2xl ${metric.tone}`}>{metric.value}</p>
            </Card>
          )
        })}
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

      {/* Create run */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Run payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="payroll-month" className="text-xs font-medium text-muted-foreground">Month</label>
              <Select id="payroll-month" value={month} onValueChange={(e) => setMonth(e.target.value)} className="w-40" aria-label="Month">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, i) => (
                    <SelectItem key={name} value={String(i + 1)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="payroll-year" className="text-xs font-medium text-muted-foreground">Year</label>
              <Select id="payroll-year" value={year} onValueChange={(e) => setYear(e.target.value)} className="w-28" aria-label="Year">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createRun} disabled={creating} className="sm:w-auto">
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {creating ? "Computing…" : "Create & compute"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Generates payslips for all ACTIVE staff with an active contract using the statutory rates configured for the year. Re-computing replaces DRAFT payslips.
          </p>
        </CardContent>
      </Card>

      {/* Annual tax summary */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Annual tax summary (P9)</p>
            <p className="text-xs text-muted-foreground">Consolidated gross, PAYE, NSSF, SHIF and Housing Levy per staff for finalized runs.</p>
          </div>
          <div className="flex items-end gap-3">
            <Select value={p9Year} onValueChange={(e) => setP9Year(e.target.value)} className="w-28" aria-label="Tax year">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => { window.location.href = `/api/hr/payroll/annual?year=${p9Year}&format=csv` }}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              Download P9
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Runs table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll runs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <TableSkeleton columns={7} rows={4} className="py-3" />
          ) : runs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-medium">No payroll runs yet</p>
              <p className="text-sm text-muted-foreground">Create the first run above to generate payslips.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Staff</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net pay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{periodLabel(run.period)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm">{run.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{run.staffCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(run.totalGross)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(run.totalDeductions)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(run.totalNet)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetail(run.id)} disabled={actionBusy}>
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

      {/* Run detail */}
      {detail && (
        <Card className="border-anglican-gold-400/60">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-3">
                {periodLabel(detail.period)}
                <Badge variant={RUN_STATUS_VARIANT[detail.status]} size="sm">{detail.status}</Badge>
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Pay date {formatDate(detail.payDate)} · {detail.staffCount} staff · Employer cost {formatCurrency(detail.totalEmployerCost)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => { window.location.href = `/api/hr/payroll/${detail.id}/export?format=register` }}>
                <FileDown className="mr-1 h-4 w-4" aria-hidden="true" />
                Register CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => { window.location.href = `/api/hr/payroll/${detail.id}/export?format=remittance` }}>
                <FileDown className="mr-1 h-4 w-4" aria-hidden="true" />
                Remittance CSV
              </Button>
              {detail.status === "DRAFT" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => runAction(detail.id, "compute")} disabled={actionBusy}>
                    Recompute
                  </Button>
                  <Button size="sm" onClick={() => runAction(detail.id, "finalize")} disabled={actionBusy}>
                    Finalize
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => runAction(detail.id, "cancel")} disabled={actionBusy}>
                    Cancel run
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)} aria-label="Close run detail">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  {detail.status === "DRAFT" && <TableHead className="text-right">Allow.</TableHead>}
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net pay</TableHead>
                  <TableHead className="text-right">Payslip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.payslips.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell className="font-medium">{slip.staff.user.name ?? "Staff"}</TableCell>
                    <TableCell className="text-sm">{slip.staff.role?.name ?? "—"}</TableCell>
                    {detail.status === "DRAFT" && (
                      <TableCell className="text-right">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          inputMode="decimal"
                          placeholder="0"
                          value={allowances[slip.staff.id] ?? ""}
                          onChange={(e) => setAllowances((prev) => ({ ...prev, [slip.staff.id]: e.target.value }))}
                          className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm tabular-nums focus-visible:border-[#d9a441] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a441]/40"
                          aria-label={`Allowance for ${slip.staff.user.name ?? "staff"}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-right tabular-nums">{formatCurrency(slip.basicSalary)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(slip.grossSalary)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(slip.totalDeductions)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(slip.netSalary)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setPayslipView(slip)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {detail.status === "DRAFT" && (
              <p className="mt-2 text-xs text-muted-foreground">
                One-off allowances: enter amounts above and click <strong>Recompute</strong>. Approved UNPAID leave (Basic ÷ 30 per day) and active salary loans are applied automatically.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payslip overlay (printable) */}
      {payslipView && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 print:static print:items-stretch print:bg-transparent print:p-0">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Payslip for ${payslipView.staff.user.name ?? "staff"}`}
            className="w-full max-w-2xl rounded-xl bg-white text-gray-900 shadow-2xl print:max-w-none print:rounded-none print:shadow-none"
          >
            <div id="payslip-print-area" className="bg-white p-6 text-gray-900 sm:p-8">
              {/* Letterhead */}
              <div className="border-b-2 border-[#1f2a44] pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-heading text-lg font-bold text-[#1f2a44]">ALL SAINTS MUSHILILIE ACADEMY</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">All Saints Mushililie · Payroll Office</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1f2a44]">PAYSLIP</p>
                    <p className="text-xs text-gray-500">{detail ? periodLabel(detail.period) : ""}</p>
                  </div>
                </div>
              </div>

              {/* Employee block */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Employee</p>
                  <p className="font-semibold">{payslipView.staff.user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Designation</p>
                  <p className="font-semibold">{payslipView.staff.role?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Employment</p>
                  <p className="font-semibold">{payslipView.staff.employmentType?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Pay date</p>
                  <p className="font-semibold">{formatDate(payslipView.payDate)}</p>
                </div>
              </div>

              {/* Earnings & deductions */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-700">Earnings</p>
                  <table className="mt-2 w-full text-sm">
                    <tbody>
                      {earnings.map((line) => (
                        <tr key={line.id} className="border-b border-gray-100">
                          <td className="py-1.5">{line.description}</td>
                          <td className="py-1.5 text-right tabular-nums">{formatCurrency(line.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-1.5">Gross pay</td>
                        <td className="py-1.5 text-right tabular-nums">{formatCurrency(payslipView.grossSalary)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <p className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-700">Deductions</p>
                  <table className="mt-2 w-full text-sm">
                    <tbody>
                      {deductions.map((line) => (
                        <tr key={line.id} className="border-b border-gray-100">
                          <td className="py-1.5">{line.description}</td>
                          <td className="py-1.5 text-right tabular-nums">{formatCurrency(line.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-1.5">Total deductions</td>
                        <td className="py-1.5 text-right tabular-nums">{formatCurrency(payslipView.totalDeductions)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net pay box */}
              <div className="mt-5 flex items-center justify-between rounded-lg border-2 border-[#1f2a44] px-4 py-3">
                <span className="text-sm font-bold uppercase tracking-wide text-[#1f2a44]">Net pay</span>
                <span className="text-xl font-bold tabular-nums text-[#1f2a44]">{formatCurrency(payslipView.netSalary)}</span>
              </div>

              {/* Employer contributions */}
              {employerLines.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Employer contributions (not deducted)</p>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
                    {employerLines.map((line) => (
                      <span key={line.id}>
                        {line.description}: <span className="font-semibold tabular-nums">{formatCurrency(line.amount)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-5 border-t border-gray-200 pt-3 text-center text-[10px] text-gray-500">
                Generated by SaintsHub on {new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })} · This payslip is computer-generated
              </p>
            </div>

            {/* Overlay actions — hidden when printing */}
            <div className="print-hidden flex items-center justify-end gap-2 border-t border-gray-200 p-4">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                Print
              </Button>
              <Button size="sm" onClick={() => setPayslipView(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
