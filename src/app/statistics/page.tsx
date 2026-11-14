"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { GraduationCap, BookOpen, Users, Wallet, CalendarDays, ClipboardCheck, FileBadge, ShieldAlert, RefreshCw } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { formatCurrency } from "@/lib/config"
import { TableSkeleton } from "@/components/ui/skeleton"

interface StatisticsData {
  grades: number
  students: number
  guardians: number
  enrolments: number
  attendanceRecords: number
  assessments: number
  reportCards: number
  kpsea: number
  disciplineIncidents: number
  clubs: number
  clubMembers: number
  invoices: number
  receipts: number
  budgetAllocated: number
  budgetSpent: number
  collectedTotal: number
  collectionRate: string
  calendarEvents: number
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/statistics", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.success) throw new Error(body?.error ?? "Request failed")
      setData(body)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Could not load statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const collectionRate = data ? Number(data.collectionRate) || 0 : 0
  const budgetUtilization = data && data.budgetAllocated > 0 ? Math.round((data.budgetSpent / data.budgetAllocated) * 100) : 0

  const sections = data ? [
    {
      title: "Academics",
      icon: BookOpen,
      stats: [
        { label: "Assessments Given", value: data.assessments.toLocaleString() },
        { label: "Report Cards Issued", value: data.reportCards.toLocaleString() },
        { label: "National Exam Registrations", value: data.kpsea.toLocaleString() },
        { label: "Club Memberships", value: `${data.clubMembers.toLocaleString()} across ${data.clubs} clubs` },
      ],
    },
    {
      title: "Attendance & Conduct",
      icon: ClipboardCheck,
      stats: [
        { label: "Attendance Records", value: data.attendanceRecords.toLocaleString() },
        { label: "Discipline Incidents", value: data.disciplineIncidents.toLocaleString() },
        { label: "Calendar Events", value: data.calendarEvents.toLocaleString() },
      ],
    },
    {
      title: "Community",
      icon: Users,
      stats: [
        { label: "Students Enrolled", value: data.students.toLocaleString() },
        { label: "Active Guardians", value: data.guardians.toLocaleString() },
        { label: "Current Term Enrolments", value: data.enrolments.toLocaleString() },
      ],
    },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">SaintsHub Statistics</h2>
          <p className="text-sm text-muted-foreground">
            Institution-wide indicators · live data
          </p>
        </div>
      </div>

      {loading && <TableSkeleton columns={4} rows={3} />}

      {!loading && error && (
        <Card className="p-6 text-center">
          <p className="font-medium text-destructive">Could not load statistics</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </Card>
      )}

      {!loading && !error && data && (
        <>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Students</p>
              <p className="mt-1 text-2xl font-bold">{data.students.toLocaleString()}</p>
            </div>
            <GraduationCap className="h-6 w-6 text-anglican-blue-700" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Grades</p>
              <p className="mt-1 text-2xl font-bold">{data.grades}</p>
            </div>
            <BookOpen className="h-6 w-6 text-anglican-blue-700" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Guardians</p>
              <p className="mt-1 text-2xl font-bold">{data.guardians.toLocaleString()}</p>
            </div>
            <Users className="h-6 w-6 text-anglican-blue-700" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Collection Rate</p>
              <p className={`mt-1 text-2xl font-bold ${collectionRate >= 70 ? "text-anglican-green-700" : "text-destructive"}`}>{collectionRate}%</p>
            </div>
            <Wallet className="h-6 w-6 text-anglican-blue-700" />
          </div>
        </Card>
      </div>

      {/* Finance strip */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Collected</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(data.collectedTotal)}</p>
              <p className="text-xs text-muted-foreground">{collectionRate}% of target</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget Allocated</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(data.budgetAllocated)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget Spent ({budgetUtilization}%)</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(data.budgetSpent)}</p>
            </div>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-anglican-blue-600" style={{ width: `${Math.min(collectionRate, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{data.invoices.toLocaleString()} invoices · {data.receipts.toLocaleString()} receipts issued</p>
        </CardContent>
      </Card>

      {/* Detail sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-anglican-blue-700" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {section.stats.map((stat) => (
                  <div key={stat.label} className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0">
                    <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                    <dd className="text-sm font-semibold">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border-dark/30 bg-card p-4 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4" />
        Sensitive operational metrics are visible to staff with the <span className="font-mono">portal:staff:read</span> permission only.
        <FileBadge className="ml-auto h-4 w-4" aria-hidden="true" />
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
      </div>
      </>
      )}
    </div>
  )
}
