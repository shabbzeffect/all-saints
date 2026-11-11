/* HRStaffDashboard - SaintsHub HR Module
 * Staff overview, leave requests and payroll snapshot
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/config"
import { TableSkeleton } from "@/components/ui/skeleton"

interface StaffRow {
  id: string
  name: string
  role: string
  employmentType: "PERMANENT" | "CONTRACT" | "DAILY"
  dateOfJoining: string
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED"
}

interface LeaveRow {
  id: string
  staffName: string
  leaveType: { name: string } | string
  daysRequested: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  startDate: string
}

/* Demo roster (until the HRIS is connected) */
const DEMO_STAFF: StaffRow[] = [
  { id: "STF-001", name: "Mary Achieng", role: "Senior Teacher — Mathematics", employmentType: "PERMANENT", dateOfJoining: "2019-01-14", status: "ACTIVE" },
  { id: "STF-002", name: "John Okoth", role: "Teacher — English", employmentType: "PERMANENT", dateOfJoining: "2021-05-03", status: "ACTIVE" },
  { id: "STF-003", name: "Jane Akinyi", role: "Bursar", employmentType: "CONTRACT", dateOfJoining: "2022-08-22", status: "ON_LEAVE" },
  { id: "STF-004", name: "Peter Mwangi", role: "Science Teacher", employmentType: "PERMANENT", dateOfJoining: "2017-09-01", status: "ACTIVE" },
  { id: "STF-005", name: "Grace Wanjiru", role: "Administrative Assistant", employmentType: "DAILY", dateOfJoining: "2024-02-12", status: "ACTIVE" },
  { id: "STF-006", name: "David Kiptoo", role: "Teacher — Kiswahili", employmentType: "CONTRACT", dateOfJoining: "2023-01-16", status: "TERMINATED" },
]

const LEAVE_STATUS_VARIANT: Record<LeaveRow["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

export function HRStaffDashboard() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRow[]>([])
  const [estimatedPayroll, setEstimatedPayroll] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/hr?action=leave-requests&staffId=staff-001", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setLeaveRequests(body?.data ?? []))
      .catch(() => setLeaveRequests([]))
      .finally(() => setLoading(false))
    fetch("/api/hr/payroll?summary=1", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setEstimatedPayroll(body?.data?.estimatedMonthlyPayroll ?? null))
      .catch(() => setEstimatedPayroll(null))
  }, [])

  const activeStaff = DEMO_STAFF.filter((s) => s.status === "ACTIVE").length
  const onLeaveStaff = DEMO_STAFF.filter((s) => s.status === "ON_LEAVE").length
  const terminatedStaff = DEMO_STAFF.filter((s) => s.status === "TERMINATED").length
  const monthlyPayroll = estimatedPayroll ?? 1_850_000

  const metrics = [
    { label: "Active Staff", value: activeStaff, tone: "text-anglican-green-700" },
    { label: "On Leave", value: onLeaveStaff, tone: "text-anglican-gold-600" },
    { label: "Terminated", value: terminatedStaff, tone: "text-destructive" },
    { label: "Monthly Payroll", value: formatCurrency(monthlyPayroll), tone: "text-anglican-blue-700" },
  ]

  const leaveTypeName = (lt: LeaveRow["leaveType"]) => (typeof lt === "string" ? lt : lt?.name ?? "Leave")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">HR Overview</h2>
          <p className="text-sm text-muted-foreground">Staff, leave and payroll across both wings</p>
        </div>
        <div className="flex gap-3 text-sm font-medium">
          <Link href="/hr/staff" className="text-anglican-blue-700 hover:underline">Staff directory →</Link>
          <Link href="/hr/leave" className="text-anglican-blue-700 hover:underline">Leave management →</Link>
          <Link href="/hr/payroll" className="text-anglican-blue-700 hover:underline">Payroll →</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <p className={`mt-1 text-2xl font-bold ${metric.tone}`}>{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Staff Members</CardTitle>
            <Link href="/hr/staff" className="text-xs font-medium text-anglican-blue-700 hover:underline">
              View all {DEMO_STAFF.length} →
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Employment</TableHead>
                  <TableHead className="text-center">Joined</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_STAFF.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.id}</div>
                    </TableCell>
                    <TableCell className="max-w-56"><span className="line-clamp-1 text-sm">{member.role}</span></TableCell>
                    <TableCell className="text-center text-xs">{member.employmentType}</TableCell>
                    <TableCell className="text-center text-sm">{new Date(member.dateOfJoining).toLocaleDateString("en-KE")}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={member.status === "ACTIVE" ? "success" : member.status === "ON_LEAVE" ? "warning" : "destructive"}
                        size="sm"
                      >
                        {member.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={6} rows={5} className="py-3" />
            ) : leaveRequests.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-medium">All caught up</p>
                <p className="text-sm text-muted-foreground">No pending leave requests.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {leaveRequests.map((request) => (
                  <li key={request.id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{request.staffName}</p>
                      <p className="text-xs text-muted-foreground">
                        {leaveTypeName(request.leaveType)} · {request.daysRequested} day{request.daysRequested === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Badge variant={LEAVE_STATUS_VARIANT[request.status] ?? "secondary"} size="sm">
                      {request.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total staff</span>
                <span className="font-semibold">{DEMO_STAFF.length}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Est. monthly payroll</span>
                <span className="font-semibold">{formatCurrency(monthlyPayroll)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
