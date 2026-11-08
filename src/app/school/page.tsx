import Link from "next/link"
import { GraduationCap, Users, Wallet, UserPlus, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const metrics = [
  { label: "Total Students", value: "2,438", sub: "across 12 grades", icon: GraduationCap },
  { label: "Active Faculty", value: "89", sub: "teaching & admin", icon: Users },
  { label: "Fee Collection", value: "75%", sub: "KSh 4.5M of KSh 6.0M", icon: Wallet },
  { label: "New Admissions", value: "42", sub: "this term", icon: UserPlus },
]

const attendance = [
  { day: "Mon", rate: 91 },
  { day: "Tue", rate: 88 },
  { day: "Wed", rate: 94 },
  { day: "Thu", rate: 82 },
  { day: "Fri", rate: 79 },
]

const links = [
  { title: "Students", href: "/school/students" },
  { title: "Attendance", href: "/school/attendance" },
  { title: "Academics", href: "/school/academics" },
  { title: "School Finance", href: "/school/finance" },
]

export default function SchoolPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">School Dashboard</h2>
        <p className="text-sm text-muted-foreground">Term 2 · 2026 — key indicators at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.sub}</p>
              </div>
              <metric className="h-6 w-6 text-anglican-blue-700" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Attendance This Week</CardTitle>
            <Link href="/school/attendance" className="flex items-center gap-1 text-xs font-medium text-anglican-blue-700 hover:underline">
              Open register <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-4">
              {attendance.map((day) => (
                <div key={day.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{day.rate}%</span>
                  <div
                    className="w-full rounded-t-md bg-anglican-blue-600"
                    style={{ height: `${Math.round((day.rate / 100) * 112)}px` }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Whole-school daily attendance, Term 2 week 7</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Fee Collection</CardTitle>
            <Link href="/school/finance" className="flex items-center gap-1 text-xs font-medium text-anglican-blue-700 hover:underline">
              Finance <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">KSh 4.5M</p>
            <p className="text-xs text-muted-foreground">of KSh 6.0M target (75%)</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-anglican-green-600" style={{ width: "75%" }} />
            </div>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Collected</dt><dd className="font-medium">KSh 4,500,000</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Outstanding</dt><dd className="font-medium text-destructive">KSh 1,500,000</dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-full border border-border px-4 py-1.5 font-medium text-anglican-blue-800 transition-colors hover:bg-anglican-blue-50">
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
