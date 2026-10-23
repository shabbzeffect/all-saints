/* ParentDashboard.tsx
 * Parent portal dashboard - main entry point
 * Provides: Parent/guardian overview, children, fee balances, quick actions
 */

import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/config"
import { formatDate } from "@/lib/dates"

interface StudentSummary {
  id: string
  admissionNumber: string
  fullName: string
  grade: string
  class: string
  attendancePercentage: number
  feeBalance: number
  isBoarding: boolean
}

interface ParentDashboardProps {
  children: StudentSummary[]
  onNavigate: (path: string) => void
}

export function ParentDashboard({ children, onNavigate }: ParentDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [feeSummary, setFeeSummary] = useState({ total: 0, paid: 0, outstanding: 0 })

  useEffect(() => {
    const total = children.reduce((sum, student) => sum + student.feeBalance, 0)
    const paid = children.reduce(
      (sum, student) => sum + Math.max(0, student.feeBalance - student.feeBalance),
      0
    )
    const outstanding = children.reduce((sum, student) => sum + student.feeBalance, 0)
    setFeeSummary({ total, paid, outstanding })
  }, [children])

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Parent Portal
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          SaintsHub School - Fee Management & Student Records
        </p>
      </header>

      {/* Children Overview Section */}
      <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm dark:bg-card-dark border border-border-dark/30">
        <h2 className="font-semibold text-anglican-blue dark:text-anglican-blue-100 mb-4">
          {children.length} Child(ren)
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="w-32">Admission No.</TableCell>
              <TableCell>Student</TableCell>
              <TableCell className="text-right">Grade</TableCell>
              <TableCell className="text-right">Attendance</TableCell>
              <TableCell className="text-right">Fee Balance</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((student) => (
              <TableRow key={student.id} className="hover:bg-angle/5 dark:hover:bg-angle/80">
                <TableCell>{student.admissionNumber}</TableCell>
                <TableCell>
                  <div className="font-medium">{student.fullName}</div>
                  <div className="text-sm text-muted/60">Grade {student.grade}</div>
                </TableCell>
                <TableCell className="text-center">{student.grade}</TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">{student.attendancePercentage}%</div>
                  <div className="text-xs text-muted/60">of classes</div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {student.feeBalance > 0 ? (
                    <span className="text-destructive">
                      KSh {student.feeBalance.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-success">Paid</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Fee Summary Bar */}
        <div className="mt-4 p-3 rounded bg-angle/5 dark:bg-angle/20">
          <div className="flex justify-between items-center mb-2">
            <span>Outstanding Balance</span>
            <span className="font-medium text-destructive">
              KSh {feeSummary.outstanding.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">{feeSummary.paid === 0 ? "0" : feeSummary.paid}</Badge>
            <Badge variant="secondary">{feeSummary.total}</Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onNavigate("/parent/pay-fees")}
          className="justify-center">
          <span className="flex items-center justify-center">
            Pay Fees
          </span>
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => onNavigate("/parent/receipts")}
          className="justify-center">
          View Receipts
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => onNavigate("/parent/report-cards")}
          className="justify-center">
          Report Cards
        </Button>
      </div>
    </div>
  )
}

ParentDashboard.displayName = "ParentDashboard"