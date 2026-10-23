/* Parish Dashboard - SaintsHub Parish Portal
Provides: Key metrics overview for parish administration
*/
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface ParishMetric {
  title: string
  value: string
  subtitle: string
  variant: "default" | "secondary" | "destructive" | "success"
  icon?: string
}

interface ParishDashboardProps {
  groups: any[]
  donations: any[]
  events: any[]
}

export function ParishDashboard({ groups, donations, events }: ParishDashboardProps) {
  const [metrics, setMetrics] = useState<ParishMetric[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    setMetrics([
      {
        title: "Active Groups",
        value: groups.length > 0 ? groups.length.toString() : "0",
        subtitle: "Cell groups & fellowships",
        variant: "default",
        icon: "Layout",
      },
      {
        title: "Total Donations",
        value: "KSh 250,000",
        subtitle: "This quarter",
        variant: "success",
        icon: "DollarSign",
      },
      {
        title: "Upcoming Events",
        value: events.length > 0 ? events.length.toString() : "0",
        subtitle: "Services & meetings",
        variant: "default",
        icon: "Calendar",
      },
    ])
  }, [groups, donations, events])

  useEffect(() => {
    // In a real app, would fetch from API
    const mockMetrics: ParishMetric[] = [
      {
        title: "Active Groups",
        value: "7",
        subtitle: "Cell groups & fellowships",
        variant: "default",
        icon: "Layout",
      },
      {
        title: "Total Donations",
        value: "KSh 250,000",
        subtitle: "This quarter",
        variant: "success",
        icon: "DollarSign",
      },
      {
        title: "Upcoming Events",
        value: "3",
        subtitle: "Services & meetings",
        variant: "default",
        icon: "Calendar",
      },
    ]
    setMetrics(mockMetrics)
  }, [])

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-purple dark:text-anglican-purple-100">
          Parish Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Parish administration overview
        </p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-angle/5 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-anglican-purple font-medium text-sm">{metric.title}</p>
                <p className="text-2xl font-bold {metric.variant === "success" ? "text-success" : metric.variant === "default" ? "text-anglican-purple" : "text-destructive"}">
                  {metric.value}
                </p>
                <p className="text-sm text-muted/60 {metric.variant === "success" ? "text-success" : metric.variant === "default" ? "text-anglican-purple" : "text-muted/60"}">
                  {metric.subtitle}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Donations Summary */}
      <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg mb-6">
        <CardHeader>
          <CardTitle>Donations Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-purple font-medium">This Quarter</p>
              <p className="font-bold text-2xl">KSh 250,000</p>
            </div>
            <div>
              <p className="text-muted/60">Last Quarter</p>
              <p className="font-bold">KSh 180,000</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-dark/30">
            <p className="text-success text-sm">
              {((250000 / 300000) * 100).toFixed(1)}% of quarterly target
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Events Calendar */}
      <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No upcoming events scheduled.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {events.map((event, index) => (
                <li key={index}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      size="sm"
                    >
                      {event.type}
                    </Badge>
                    <span>
                      {event.title} - {event.startDate}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}