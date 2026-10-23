/* School Dashboard - SaintsHub School Portal
Provides: Key metrics overview for school administration
*/
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface SchoolMetric {
  title: string
  value: string
  subtitle: string
  variant: "default" | "secondary" | "destructive" | "success"
  icon?: string
}

interface DashboardFilters {
  grade?: string
  status?: string
}

export function SchoolDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    grade: "",
    status: "",
  })
  const searchParams = useSearchParams()

  // Initialize filters from URL
  useEffect(() => {
    const grade = searchParams.get("grade") || ""
    const status = searchParams.get("status") || ""
    setFilters({ grade, status })
  }, [searchParams])

  const fetchMetrics = useCallback(async () => {
    // Fetch key school metrics
    const metrics: SchoolMetric[] = [
      {
        title: "Total Students",
        value: "2,438",
        subtitle: "Enrolled across all grades",
        variant: "default",
        icon: "User",
      },
      {
        title: "Active Faculty",
        value: "89",
        subtitle: "Teaching & administrative staff",
        variant: "default",
        icon: "Users",
      },
      {
        title: "This Term's Fee Collection",
        value: "KSh 4,500,000",
        subtitle: "of target KSh 6,000,000",
        variant: "warning",
        icon: "DollarSign",
      },
      {
        title: "Recent Admissions",
        value: "42",
        subtitle: "New students enrolled this term",
        variant: "success",
        icon: "UserPlus",
      },
    ]

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return metrics
  }, [searchParams])

  const fetchSummaryData = useCallback(async () => {
    // Fetch summary tables
    const response = await fetch(`/api/school/attendance?institutionId=inst-school-1${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    return data.data || { records: [], summary: {} }
  }, [searchParams])

  const [metrics, setMetrics] = useState<SchoolMetric[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    attendancePercentage: 0,
  })

  useEffect(() => {
    fetchMetrics().then(setMetrics)
    fetchSummaryData().then(({ records, summary }) => {
      setAttendanceRecords(records || [])
      setAttendanceSummary(summary || { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, attendancePercentage: 0 })
    })
  }, [fetchMetrics, fetchSummaryData])

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          School Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Key metrics & school overview
        </p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <p className="text-anglican-blue font-medium text-sm">{metric.title}</p>
                <p className="text-3xl font-bold {metric.variant === "success" ? "text-success" : metric.variant === "warning" ? "text-destructive" : "text-anglican-blue"}">
                  {metric.value}
                </p>
                <p className="text-sm text-muted/60 {metric.variant === "success" ? "text-success" : metric.variant === "warning" ? "text-destructive" : "text-muted/60"}">
                  {metric.subtitle}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Attendance Summary */}
        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted/60">Total Days</p>
                <p className="font-medium">{attendanceSummary.totalDays}</p>
              </div>
              <div>
                <p className="text-muted/60">Present</p>
                <p className="font-medium text-success">{attendanceSummary.presentDays}</p>
              </div>
              <div>
                <p className="text-muted/60">Absent</p>
                <p className="font-medium text-destructive">{attendanceSummary.absentDays}</p>
              </div>
              <div>
                <p className="text-muted/60">Late</p>
                <p className="font-medium text-anglican-blue">{attendanceSummary.lateDays}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-dark/30">
              <p className="text-muted/60">Attendance Rate</p>
              <p className="font-medium text-anglican-blue">
                {attendanceSummary.attendancePercentage}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Admissions */}
        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted/60 text-sm">
              42 new students enrolled this term. Admission applications are being processed.
            </p>
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <CardHeader>
            <CardTitle>Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-anglican-blue font-medium">This Term</p>
                <p className="font-bold text-3xl">KSh 4,500,000</p>
              </div>
              <div>
                <p className="text-muted/60">Target</p>
                <p className="font-bold">KSh 6,000,000</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-dark/30">
              <p className="text-success text-sm">
                {((4500000 / 6000000) * 100).toFixed(1)}% of target achieved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}