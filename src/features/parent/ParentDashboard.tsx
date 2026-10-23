/* Parent Feature - SaintsHub Parent Portal
Provides: Parent/guardian dashboard, fee payments, receipts, report cards
*/
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/spinner"
import { useState, useEffect } from "react"

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
    // Calculate fee summary from children data
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 010-2 1 1 0 010 2zm1.66-5.05a1 1 0 010 1.7 1 1 0 01-1.66 0L10 7.76 6.34 4.05a1 1 0 111.33-1.7zM12 8a4 4 0 110 8 4 4 0 010-8z" />
            </svg>
            Pay Fees
          </span>
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => onNavigate("/parent/receipts")}
          className="justify-center">
          <span className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M12 1a3 3 0 00-3 3v6a3 3 0 006 0V4a3 3 0 00-3-3zm6 13a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
            </svg>
            View Receipts
          </span>
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => onNavigate("/parent/report-cards")}
          className="justify-center">
          <span className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2zm0 3a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V8a2 2 0 012-2zm9 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm-5 7a2 2 0 01-2-2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2zm2-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Report Cards
          </span>
        </Button>
      </div>
    </div>
  )
}