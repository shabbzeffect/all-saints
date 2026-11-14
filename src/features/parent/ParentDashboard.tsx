/* ParentDashboard - SaintsHub Parent Portal
 * Children overview, outstanding balances and quick actions
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Receipt, FileText, Users, Wallet, GraduationCap } from "lucide-react"
import type { StudentSummary } from "./types"

interface ParentDashboardProps {
  students: StudentSummary[]
  onNavigate: (path: string) => void
}

export function ParentDashboard({ students, onNavigate }: ParentDashboardProps) {
  const totalBalance = students.reduce((sum, s) => sum + Math.max(s.feeBalance, 0), 0)
  const avgAttendance =
    students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length)
      : 0
  const boardingCount = students.filter((s) => s.isBoarding).length

  const metrics = [
    { label: "Children Enrolled", value: students.length, icon: Users },
    { label: "Outstanding Balance", value: `KSh ${totalBalance.toLocaleString()}`, icon: Wallet },
    { label: "Average Attendance", value: `${avgAttendance}%`, icon: GraduationCap },
    { label: "Boarding", value: boardingCount, icon: Users },
  ]

  const quickActions = [
    { title: "Pay Fees", description: "M-Pesa or bank transfer", href: "/parent/pay-fees", icon: CreditCard },
    { title: "Receipts", description: "Download payment receipts", href: "/parent/receipts", icon: Receipt },
    { title: "Report Cards", description: "View and acknowledge reports", href: "/parent/report-cards", icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Parent Portal</h2>
        <p className="text-sm text-muted-foreground">Fee management, attendance and academic records for your children</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold">{metric.value}</p>
              </div>
               <metric.icon className="h-6 w-6 text-anglican-blue-700" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action.href}
            onClick={() => onNavigate(action.href)}
            className="group rounded-xl border border-border bg-card p-5 text-left cursor-pointer transition-colors duration-200 hover:border-anglican-blue-400 hover:bg-anglican-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-anglican-blue-500"
          >
            <action.icon className="h-6 w-6 text-anglican-blue-700 transition-colors group-hover:text-anglican-blue-800" />
            <p className="mt-3 font-semibold">{action.title}</p>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>My Children</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">Residence</TableHead>
                <TableHead className="text-right">Fee Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.admissionNumber}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell className="text-center">{student.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={student.attendancePercentage >= 80 ? "success" : "warning"} size="sm">
                      {student.attendancePercentage}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={student.isBoarding ? "primary" : "secondary"} size="sm">
                      {student.isBoarding ? "Boarding" : "Day"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {student.feeBalance > 0 ? (
                      <span className="text-destructive">KSh {student.feeBalance.toLocaleString()}</span>
                    ) : (
                      <span className="text-anglican-green-700">Paid</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


