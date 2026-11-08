import Link from "next/link"
import { Users, Church, HandCoins, CalendarDays, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const metrics = [
  { label: "Active Members", value: "312", sub: "across 24 cell groups", icon: Users },
  { label: "Weekly Offerings", value: "KSh 450K", sub: "avg. last 4 Sundays", icon: HandCoins },
  { label: "New Baptisms", value: "12", sub: "since January", icon: Church },
  { label: "Upcoming Events", value: "8", sub: "this month", icon: CalendarDays },
]

const upcoming = [
  { day: "08 Nov", title: "Sunday Eucharist & Sermon", time: "08:00", type: "SERVICE" },
  { day: "12 Nov", title: "Choir Rehearsal", time: "18:30", type: "REHEARSAL" },
  { day: "15 Nov", title: "Cell Group Leaders' Meeting", time: "10:00", type: "MEETING" },
  { day: "22 Nov", title: "Youth Outreach — Kibra", time: "09:00", type: "OUTREACH" },
]

const links = [
  { title: "Members", href: "/parish/members" },
  { title: "Groups", href: "/parish/groups" },
  { title: "Events", href: "/parish/events" },
  { title: "Communications", href: "/parish/communications" },
  { title: "Parish Finance", href: "/parish/finance" },
]

export default function ParishPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Parish Dashboard</h2>
        <p className="text-sm text-muted-foreground">All Saints Mushililie — ministry overview</p>
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
              <metric className="h-6 w-6 text-anglican-purple-700" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming Events</CardTitle>
            <Link href="/parish/events" className="flex items-center gap-1 text-xs font-medium text-anglican-purple-700 hover:underline">
              All events <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {upcoming.map((event) => (
                <li key={event.title} className="flex items-center gap-4 py-3">
                  <div className="w-14 shrink-0 rounded-lg bg-anglican-purple-50 p-2 text-center">
                    <p className="text-lg font-bold leading-none text-anglican-purple-800">{event.day.split(" ")[0]}</p>
                    <p className="text-[10px] font-semibold uppercase text-anglican-purple-600">{event.day.split(" ")[1]}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <Badge variant="secondary" size="sm" className="ml-auto">{event.type}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Building Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">67%</p>
            <p className="text-xs text-muted-foreground">KSh 8.0M of KSh 12.0M raised</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-anglican-purple-600" style={{ width: "67%" }} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Dedication of the new parish hall is scheduled for the feast of St. Andrew. Every blessing counts.
            </p>
            <Link
              href="/parish/finance"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-anglican-purple-800 hover:underline"
            >
              View parish finance <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-full border border-border px-4 py-1.5 font-medium text-anglican-purple-800 transition-colors hover:bg-anglican-purple-50">
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
