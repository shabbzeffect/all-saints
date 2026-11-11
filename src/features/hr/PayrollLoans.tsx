/* PayrollLoans - SaintsHub HR Module
 * Salary loans & advances: grant against pay, auto-deducted monthly in payroll runs.
 * Outstanding balance is derived from FINAL payslips; DRAFT runs never count.
 */
"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ChevronDown, ChevronRight, Loader2, HandCoins } from "lucide-react"
import { formatCurrency } from "@/lib/config"

interface StaffOption {
  id: string
  name: string
  email: string | null
  role: string | null
  basicSalary: number
}

interface SalaryLoan {
  id: string
  description: string
  principal: number
  monthlyInstallment: number
  outstanding: number
  status: "ACTIVE" | "SETTLED" | "CANCELLED"
  startPeriod: string
  notes: string | null
  staff: {
    id: string
    user: { name: string | null; email: string | null }
    role: { name: string | null } | null
  }
}

interface LoanDetail extends SalaryLoan {
  repayments: {
    id: string
    amount: number
    period: string
    payslip: { id: string; status: string }
  }[]
}

const STATUS_VARIANT: Record<SalaryLoan["status"], "info" | "success" | "secondary"> = {
  ACTIVE: "info",
  SETTLED: "success",
  CANCELLED: "secondary",
}

export function PayrollLoans() {
  const [loans, setLoans] = useState<SalaryLoan[]>([])
  const [staff, setStaff] = useState<StaffOption[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [history, setHistory] = useState<LoanDetail | null>(null)

  const [staffId, setStaffId] = useState("")
  const [description, setDescription] = useState("")
  const [principal, setPrincipal] = useState("")
  const [installment, setInstallment] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [loansRes, staffRes] = await Promise.all([
        fetch("/api/hr/payroll/loans", { cache: "no-store" }),
        fetch("/api/hr/payroll/staff", { cache: "no-store" }),
      ])
      const loansBody = await loansRes.json().catch(() => null)
      const staffBody = await staffRes.json().catch(() => null)
      if (!loansRes.ok) {
        setMessage({ tone: "error", text: loansBody?.error ?? "You do not have access to payroll loans" })
      }
      setLoans(loansBody?.data ?? [])
      setStaff(staffBody?.data ?? [])
    } catch {
      setLoans([])
      setStaff([])
      setMessage({ tone: "error", text: "Could not load loans" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const activeLoans = loans.filter((l) => l.status === "ACTIVE")
  const outstandingTotal = activeLoans.reduce((sum, l) => sum + l.outstanding, 0)
  const settledCount = loans.filter((l) => l.status === "SETTLED").length

  const toggleHistory = async (id: string) => {
    if (expanded === id) {
      setExpanded(null)
      setHistory(null)
      return
    }
    setExpanded(id)
    setHistory(null)
    try {
      const res = await fetch(`/api/hr/payroll/loans/${id}`, { cache: "no-store" })
      const body = await res.json()
      if (res.ok) setHistory(body.data)
    } catch {
      setHistory(null)
    }
  }

  const grantLoan = async () => {
    const principalNum = parseFloat(principal)
    const installmentNum = parseFloat(installment)
    if (!staffId) {
      setMessage({ tone: "error", text: "Select a staff member first." })
      return
    }
    if (!description.trim()) {
      setMessage({ tone: "error", text: "Enter a description (e.g. SACCO loan)." })
      return
    }
    if (!(principalNum > 0) || !(installmentNum > 0)) {
      setMessage({ tone: "error", text: "Principal and installment must both be greater than 0." })
      return
    }
    const staffMember = staff.find((s) => s.id === staffId)
    if (
      !window.confirm(
        `Grant ${formatCurrency(principalNum)} to ${staffMember?.name ?? "staff"} at ${formatCurrency(installmentNum)}/month?`
      )
    ) {
      return
    }

    setCreating(true)
    setMessage(null)
    try {
      const res = await fetch("/api/hr/payroll/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          description: description.trim(),
          principal: principalNum,
          monthlyInstallment: installmentNum,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Failed to grant loan" })
        return
      }
      setMessage({ tone: "info", text: body?.message ?? "Loan granted" })
      setStaffId("")
      setDescription("")
      setPrincipal("")
      setInstallment("")
      await load()
    } finally {
      setCreating(false)
    }
  }

  const loanAction = async (loan: SalaryLoan, action: "cancel" | "settle") => {
    const verb = action === "cancel" ? "Cancel" : "Settle"
    if (!window.confirm(`${verb} loan “${loan.description}” for ${loan.staff.user.name ?? "staff"}?`)) return
    setActionBusy(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/hr/payroll/loans/${loan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? `Failed to ${action} loan` })
        return
      }
      setMessage({ tone: "info", text: body?.message ?? `Loan ${action}d` })
      if (expanded === loan.id) {
        setExpanded(null)
        setHistory(null)
      }
      await load()
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href="/hr/payroll" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-anglican-blue-700 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Payroll
        </Link>
        <h2 className="text-xl font-bold">Salary loans</h2>
        <p className="text-sm text-muted-foreground">
          Loans and advances against pay — deducted automatically from each payroll run after statutory deductions.
          Outstanding is derived from finalized payslips; recomputing or cancelling a run adjusts it automatically.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Active loans", value: String(activeLoans.length), tone: "text-anglican-blue-700" },
          { label: "Outstanding balance", value: formatCurrency(outstandingTotal), tone: "text-anglican-gold-600" },
          { label: "Settled loans", value: String(settledCount), tone: "text-anglican-green-700" },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className={`mt-1 truncate text-lg font-bold sm:text-2xl ${m.tone}`}>{m.value}</p>
          </Card>
        ))}
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

      {/* Grant loan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HandCoins className="h-5 w-5 text-anglican-gold-600" aria-hidden="true" />
            Grant a loan / advance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label htmlFor="loan-staff" className="text-xs font-medium text-muted-foreground">Staff member</label>
              <Select id="loan-staff" value={staffId} onValueChange={(e) => setStaffId(e.target.value)} className="w-full" aria-label="Staff member">
                <SelectTrigger><SelectValue placeholder="Select staff…" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.role ?? "Staff"} ({formatCurrency(s.basicSalary)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label htmlFor="loan-description" className="text-xs font-medium text-muted-foreground">Description</label>
              <Input
                id="loan-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. SACCO loan, Emergency advance"
                maxLength={200}
              />
            </div>
            <div className="flex w-full flex-col gap-1 sm:w-40">
              <label htmlFor="loan-principal" className="text-xs font-medium text-muted-foreground">Principal (KES)</label>
              <Input
                id="loan-principal"
                type="number"
                min={1}
                step={1000}
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="60,000"
                inputMode="decimal"
              />
            </div>
            <div className="flex w-full flex-col gap-1 sm:w-40">
              <label htmlFor="loan-installment" className="text-xs font-medium text-muted-foreground">Monthly (KES)</label>
              <Input
                id="loan-installment"
                type="number"
                min={1}
                step={500}
                value={installment}
                onChange={(e) => setInstallment(e.target.value)}
                placeholder="5,000"
                inputMode="decimal"
              />
            </div>
            <Button onClick={grantLoan} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {creating ? "Granting…" : "Grant loan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loans table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan book</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <TableSkeleton columns={7} rows={4} className="py-3" />
          ) : loans.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-medium">No loans yet</p>
              <p className="text-sm text-muted-foreground">Grant the first salary advance above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <Fragment key={loan.id}>
                    <TableRow>
                      <TableCell>
                        <div className="font-medium">{loan.staff.user.name ?? "Staff"}</div>
                        <div className="text-xs text-muted-foreground">{loan.staff.role?.name ?? ""}</div>
                      </TableCell>
                      <TableCell className="max-w-56">
                        <span className="line-clamp-1 text-sm">{loan.description}</span>
                        <span className="text-xs text-muted-foreground">from {loan.startPeriod}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(loan.principal)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(loan.monthlyInstallment)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(loan.outstanding)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={STATUS_VARIANT[loan.status]} size="sm">{loan.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toggleHistory(loan.id)} aria-label="Toggle repayment history" aria-expanded={expanded === loan.id}>
                            {expanded === loan.id
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </Button>
                          {loan.status === "ACTIVE" && (
                            <>
                              {loan.outstanding <= 0 && (
                                <Button variant="outline" size="sm" onClick={() => loanAction(loan, "settle")} disabled={actionBusy}>
                                  Settle
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => loanAction(loan, "cancel")} disabled={actionBusy}>
                                <span className="text-destructive">Cancel</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded === loan.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/40 p-3">
                          {!history ? (
                            <p className="text-xs text-muted-foreground">Loading repayment history…</p>
                          ) : history.repayments.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No repayments yet — the first installment applies to the next payroll run.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {history.repayments.map((r) => (
                                <span key={r.id} className="rounded-md border border-border bg-background px-2 py-1 tabular-nums">
                                  {r.period}: <strong>{formatCurrency(r.amount)}</strong>{" "}
                                  <span className={r.payslip.status === "FINAL" ? "text-anglican-green-700" : "text-muted-foreground"}>
                                    ({r.payslip.status})
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
