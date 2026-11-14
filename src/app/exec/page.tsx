"use client"

import { Card } from "@/components/ui/card"
import { Users, GraduationCap, TrendingUp, Wallet, AlertCircle, Building2, RefreshCw } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/config"
import { formatCurrency } from "@/lib/config"
import { TableSkeleton } from "@/components/ui/skeleton"

type Institution = "school" | "parish"

interface ArrearsGrade {
  grade: string
  amount: number
  learners: number
}
interface SchoolSummary {
  students: { total: number; active: number; withdrawn: number }
  staff: { total: number; teachers: number }
  finance: {
    invoiced: number
    collected: number
    outstanding: number
    collectionRate: number
    receipts: number
    overdueStudents: number
    creditHeld: number
    creditStudents: number
    paidInvoices: number
    settleRate: number
    activeRate: number
    topThreeArrears: number
    topThreeConcentration: number
  }
  arrearsByGrade: ArrearsGrade[]
}

const kes = (n: number) => formatCurrency(n)

export default function ExecDashboard() {
  const [institution, setInstitution] = useState<Institution | null>("school")
  const [school, setSchool] = useState<SchoolSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/exec/summary", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.success) throw new Error(body?.error ?? "Request failed")
      setSchool(body.data?.school ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load executive summary")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const topThree = school?.arrearsByGrade.slice(0, 3) ?? []
  const topThreeNames = topThree.map((g) => g.grade).join(", ")
  const topThreeLearners = topThree.reduce((s, g) => s + g.learners, 0)

  const kpis = school
    ? [
        { label: "Enrolled Learners", value: String(school.students.total), sub: `${school.students.active} active · ${school.students.withdrawn} withdrawn`, icon: GraduationCap },
        { label: "Staff on Roster", value: String(school.staff.total), sub: `${school.staff.teachers} teaching staff`, icon: Users },
        { label: "Fees Collected", value: kes(school.finance.collected), sub: `${school.finance.collectionRate}% of ${kes(school.finance.invoiced)} invoiced · ${school.finance.receipts} receipts`, icon: Wallet },
        { label: "Arrears Outstanding", value: kes(school.finance.outstanding), sub: `${school.finance.overdueStudents} learners owing`, icon: AlertCircle },
      ]
    : []

  const momentum = school
    ? [
        { label: "Fee Collection", value: Math.min(100, school.finance.collectionRate), suffix: "%" },
        { label: "Learners Settled", value: school.finance.settleRate, suffix: "%" },
        { label: "Active Register", value: school.finance.activeRate, suffix: "%" },
        { label: "Arrears Cleared", value: Math.max(0, Math.min(100, Math.round((1 - school.finance.outstanding / (school.finance.invoiced || 1)) * 100))), suffix: "%" },
      ]
    : []

  const showSchool = institution === "school" || institution === null
  const showParish = institution === "parish" || institution === null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            {institution === null ? "SaintsHub Executive Dashboard" : `${institution === "school" ? "School" : "Parish"} Executive Dashboard`}
          </h2>
          <p className="text-sm text-muted-foreground">Board-level indicators — live from the school ledger</p>
        </div>

        <div role="tablist" aria-label="Institution" className="inline-flex rounded-lg border border-border bg-muted p-1">
          {([
            { id: "school", label: "School" },
            { id: "parish", label: "Parish" },
            { id: null, label: "Both" },
          ] as const).map((opt) => (
            <button
              key={opt.label}
              role="tab"
              aria-selected={institution === opt.id}
              onClick={() => setInstitution(opt.id as Institution | null)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                institution === opt.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <TableSkeleton columns={4} rows={3} />}

      {!loading && error && (
        <Card className="p-6 text-center">
          <p className="font-medium text-destructive">Could not load executive summary</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </Card>
      )}

      {!loading && !error && school && showSchool && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                  <kpi.icon className="h-6 w-6 shrink-0 text-anglican-blue-700" strokeWidth={1.5} aria-hidden="true" />
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Delivery Momentum</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4 space-y-4">
                {momentum.map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold">{row.value}{row.suffix}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-anglican-blue-600" style={{ width: `${Math.min(100, row.value)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Arrears cleared = 1 − (arrears ÷ 2026 fees invoiced). Settled = invoices at PAID.</p>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold">Watchlist</h3>
              <ul className="mt-3 divide-y divide-border text-sm">
                <li className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">Grades {topThreeNames} fee arrears</p>
                    <p className="text-xs text-muted-foreground">{kes(school.finance.topThreeArrears)} across {topThreeLearners} learners — {school.finance.topThreeConcentration}% of all arrears</p>
                  </div>
                  <span className="rounded-full bg-anglican-gold-100 px-2 py-0.5 text-xs font-medium text-anglican-gold-800">Finance</span>
                </li>
                <li className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">Learner credit balances</p>
                    <p className="text-xs text-muted-foreground">{kes(school.finance.creditHeld)} held by {school.finance.creditStudents} learners — unapplied credits from overpayment</p>
                  </div>
                  <span className="rounded-full bg-anglican-gold-100 px-2 py-0.5 text-xs font-medium text-anglican-gold-800">Finance</span>
                </li>
                <li className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">Duplicate admission numbers</p>
                    <p className="text-xs text-muted-foreground">4 numbers shared by two learners (1180, 1036, 690, 695) — registrar to reissue</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Urgent</span>
                </li>
                <li className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">Attendance register empty</p>
                    <p className="text-xs text-muted-foreground">No attendance records imported yet — registers can’t be marked until setup is done</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Urgent</span>
                </li>
              </ul>
            </Card>
          </div>
        </>
      )}

      {!loading && !error && showParish && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-anglican-blue-700" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Parish — not connected yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No parish institution exists in the database, so there is no live data to show. Membership,
                cash-flow and ministry indicators will appear here once the parish is onboarded (Wave 2 data:
                parish council, member directory, giving/pledges). Until then this view will not display figures.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
