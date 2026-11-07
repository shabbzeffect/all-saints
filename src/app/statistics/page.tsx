"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { GraduationCap, BookOpen, Users, Wallet, CalendarDays, ClipboardCheck, FileBadge, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/config"

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

const DEMO_DATA: StatisticsData = {
  grades: 12,
  students: 2438,
  guardians: 1867,
  enrolments: 420,
  attendanceRecords: 184320,
  assessments: 3612,
  reportCards: 2380,
  kpsea: 156,
  disciplineIncidents: 27,
  clubs: 34,
  clubMembers: 1240,
  invoices: 5621,
  receipts: 4982,
  budgetAllocated: 48_000_000,
  budgetSpent: 31_200_000,
  collectedTotal: 36_000_000,
  collectionRate: "75",
  calendarEvents: 96,
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData>(DEMO_DATA)
  const [live, setLive] = useState(false)

  useEffect(() => {
    fetch("/api/statistics", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body && typeof body.students === "number") {
          setData({ ...DEMO_DATA, ...body })
          setLive(true)
        }
      })
      .catch(() => setLive(false))
  }, [])

  const collectionRate = Number(data.collectionRate) || 0
  const budgetUtilization = data.budgetAllocated > 0 ? Math.round((data.budgetSpent / data.budgetAllocated) * 100) : 0

  const sections = [
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
        { label: "Term 1 Enrolments", value: data.enrolments.toLocaleString() },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">SaintsHub Statistics</h2>
          <p className="text-sm text-muted-foreground">
            Institution-wide indicators {live ? "· live data" : "· demo data shown while the database is offline"}
          </p>
        </div>
      </div>

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
        Sensitive operational metrics are visible to administrators with the <span className="font-mono">statistics:read</span> permission only.
        <FileBadge className="ml-auto h-4 w-4" aria-hidden="true" />
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
      </div>
    </div>
  )
}
