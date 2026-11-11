/* HRStaffDashboard - SaintsHub HR Module
 * Live staff overview: roster, leave activity and payroll snapshot for the institution.
 * Data source: /api/hr/directory (salary figures are payroll data, not this view).
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { formatCurrency } from "@/lib/config"
import { TableSkeleton } from "@/components/ui/skeleton"

interface StaffRow {
  id: string
  name: string
  email: string
  role: string
  employmentType: string
  employmentTypeName: string
  dateOfJoining: string
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED"
}

interface LeaveRow {
  id: string
  staffName: string
  leaveType: string
  daysRequested: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  startDate: string
}

interface DirectoryPayload {
  staff: StaffRow[]
  leaveRequests: LeaveRow[]
  summary: {
    totalStaff: number
    activeStaff: number
    onLeave: number
    terminated: number
    inactive: number
    estimatedMonthlyPayroll: number
  }
}

const STATUS_VARIANT: Record<StaffRow["status"], "success" | "warning" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  INACTIVE: "secondary",
  TERMINATED: "destructive",
}

const LEAVE_STATUS_VARIANT: Record<LeaveRow["status"], "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
}

export function HRStaffDashboard() {
  const [data, setData] = useState<DirectoryPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hr/directory", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(body?.error ?? "Could not load staff data")
        return
      }
      setData(body.data)
    } catch {
      setMessage("Could not load staff data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const staff = data?.staff ?? []
  const leaveRequests = data?.leaveRequests ?? []
  const summary = data?.summary

  const metrics = [
    { label: "Active Staff", value: String(summary?.activeStaff ?? "—"), tone: "text-anglican-green-700" },
    { label: "On Leave", value: String(summary?.onLeave ?? "—"), tone: "text-anglican-gold-600" },
    { label: "Terminated", value: String(summary?.terminated ?? "—"), tone: "text-destructive" },
    { label: "Est. Monthly Payroll", value: summary ? formatCurrency(summary.estimatedMonthlyPayroll) : "—", tone: "text-anglican-blue-700" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">HR Overview</h2>
          <p className="text-sm text-muted-foreground">Live staff, leave and payroll across the institution</p>
        </div>
        <div className="flex gap-3 text-sm font-medium">
          <Link href="/hr/staff" className="text-anglican-blue-700 hover:underline">Staff directory →</Link>
          <Link href="/hr/leave" className="text-anglican-blue-700 hover:underline">Leave management →</Link>
          <Link href="/hr/payroll" className="text-anglican-blue-700 hover:underline">Payroll →</Link>
        </div>
      </div>

      {message && (
        <div role="status" className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <p className={`mt-1 truncate text-lg font-bold sm:text-2xl ${metric.tone}`}>{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Staff Members</CardTitle>
            <Link href="/hr/staff" className="text-xs font-medium text-anglican-blue-700 hover:underline">
              View directory {staff.length > 0 ? `(${staff.length})` : ""} →
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <TableSkeleton columns={5} rows={6} className="py-3" />
            ) : staff.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-medium">No staff records yet</p>
                <p className="text-sm text-muted-foreground">Staff appear here once the HR team imports them.</p>
              </div>
            ) : (
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
                  {staff.slice(0, 8).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </TableCell>
                      <TableCell className="max-w-56"><span className="line-clamp-1 text-sm">{member.role}</span></TableCell>
                      <TableCell className="text-center text-xs" title={member.employmentTypeName}>{member.employmentType}</TableCell>
                      <TableCell className="text-center text-sm">{new Date(member.dateOfJoining).toLocaleDateString("en-KE")}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={STATUS_VARIANT[member.status]} size="sm">
                          {member.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={3} rows={4} className="py-3" />
            ) : leaveRequests.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-medium">All caught up</p>
                <p className="text-sm text-muted-foreground">No leave requests on file.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {leaveRequests.slice(0, 6).map((request) => (
                  <li key={request.id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{request.staffName}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.leaveType} · {request.daysRequested} day{request.daysRequested === 1 ? "" : "s"}
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
                <span className="font-semibold">{summary?.totalStaff ?? "—"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Est. monthly payroll</span>
                <span className="font-semibold">{summary ? formatCurrency(summary.estimatedMonthlyPayroll) : "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
