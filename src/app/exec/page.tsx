"use client"

import { Card } from "@/components/ui/card"
import { Users, Building2, Heart, GraduationCap, TrendingUp, Wallet } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/config"
import { formatCurrency } from "@/lib/config"

type Institution = "school" | "parish"

const KPI_DATA: Record<Institution, Array<{ label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }> }>> = {
  school: [
    { label: "Enrolled Students", value: "2,438", sub: "+42 this term", icon: GraduationCap },
    { label: "Active Teachers", value: "89", sub: "12 departments", icon: Users },
    { label: "Fee Collection Rate", value: "75%", sub: "KSh 4.5M of KSh 6.0M", icon: Heart },
    { label: "Capacity Remaining", value: "156", sub: "across 12 grades", icon: Building2 },
  ],
  parish: [
    { label: "Active Members", value: "312", sub: "24 cell groups", icon: Users },
    { label: "Weekly Offerings", value: formatCurrency(450_000), sub: "4-week average", icon: Wallet },
    { label: "Building Fund Progress", value: "67%", sub: "KSh 8.0M of KSh 12.0M", icon: Building2 },
    { label: "New Baptisms", value: "12", sub: "since January", icon: GraduationCap },
  ],
}

const MOMENTUM = [
  { label: "Attendance", value: 87, suffix: "%" },
  { label: "Fee Collection", value: 75, suffix: "%" },
  { label: "Programme Utilization", value: 68, suffix: "%" },
  { label: "Budget Utilization", value: 65, suffix: "%" },
]

export default function ExecDashboard() {
  const [institution, setInstitution] = useState<Institution | null>("school")
  const active: Institution = institution ?? "school"
  const kpis = KPI_DATA[active]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            {institution === null ? "SaintsHub Executive Dashboard" : `${active === "school" ? "School" : "Parish"} Executive Dashboard`}
          </h2>
          <p className="text-sm text-muted-foreground">Board-level indicators for All Saints Mushililie</p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
              <div className="rounded-lg bg-anglican-blue-50 p-2.5 text-anglican-blue-700">
                <kpi.icon className="h-6 w-6" />
              </div>
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
            {MOMENTUM.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold">{row.value}{row.suffix}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-anglican-blue-600" style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Watchlist</h3>
          <ul className="mt-3 divide-y divide-border text-sm">
            <li className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">Grade 7 fee default rate</p>
                <p className="text-xs text-muted-foreground">18% of families &gt;30 days overdue</p>
              </div>
              <span className="rounded-full bg-anglican-gold-100 px-2 py-0.5 text-xs font-medium text-anglican-gold-800">Review</span>
            </li>
            <li className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">Chapel roof repairs</p>
                <p className="text-xs text-muted-foreground">KSh 650K pending treasurer approval</p>
              </div>
              <span className="rounded-full bg-anglican-blue-100 px-2 py-0.5 text-xs font-medium text-anglican-blue-800">Finance</span>
            </li>
            <li className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">KPSEA registration deadline</p>
                <p className="text-xs text-muted-foreground">12 candidates missing documentation</p>
              </div>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Urgent</span>
            </li>
            <li className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">Teacher appraisals</p>
                <p className="text-xs text-muted-foreground">64% completed — target 100% by end of month</p>
              </div>
              <span className="rounded-full bg-anglican-gold-100 px-2 py-0.5 text-xs font-medium text-anglican-gold-800">HR</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
