/* eslint-disable react/prop-types */
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/spinner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ReportCardItem {
  id: string
  term: string
  academicYear: string
  issueDate: string
  overallGrade: string
  overallScore: number
  subjects: {
    name: string
    grade: string
    score: number
  }[]
  studentName: string
  admissionNumber: string
  downloaded: boolean
  parentAcknowledged: boolean
}

interface ReportCardsProps {
  reportCards: ReportCardItem[]
  onAcknowledge: (reportId: string) => void
}

export function ReportCards({ reportCards, onAcknowledge }: ReportCardsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fetch report cards from API if not provided
  }, [])

  if (reportCards.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted dark:text-muted-foreground">
          No report cards found. Check back after grades are released.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Report Cards
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Academic records for your children
        </p>
      </div>

      {/* Report Cards Table */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Academic Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Term</TableCell>
                <TableCell>Student</TableCell>
                <TableCell className="text-right">Overall</TableCell>
                <TableCell className="text-center">Acknowledged</TableCell>
                <TableCell className="text-center">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportCards.map((report) => (
                <TableRow key={report.id} className="hover:bg-angle/5 dark:hover:bg-angle/80">
                  <TableCell>{report.term}</TableCell>
                  <TableCell>
                    <div className="font-medium">{report.studentName}</div>
                    <div className="text-xs text-muted/60">Adm: {report.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {report.overallGrade} ({report.overholdScore || report.overallScore})
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={report.parentAcknowledged ? "default" : "destructive"}
                      size="sm"
                    >
                      {report.parentAcknowledged ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      variant="link"
                      onClick={() => onAcknowledge(report.id)}
                      aria-label="Acknowledge report card"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M15.66 3.79a.75.75 0 00-.3-.86l-7.61 2.15a3.5 3.5 0 01-2.07-1.09H4.58a3.5 3.5 0 01-2.07 1.09l-7.61-2.15a.75.75 0 00-.8.34 7.027 7.027 0 001.83 2.15l.31.13a.75.75 0 00.3.86l7.62-2.15a7.577 7.577 0 001.98-.06 7.576 7.576 0 002.19 1.41l.28.31a.75.75 0 00.3.85l-7.63 2.16a.75.75 0 00-.3.86 11.928 11.928 0 011.78 1.23l.32-.12a.75.75 0 00-.3-.85l7.61 2.15a11.958 11.958 0 001.76-1.23l.31.12a.75.75 0 00.3-.86l-7.62-2.15a9.235 9.235 0 00-.29-1.37l-.3-.11a.75.75 0 00-.3-.85 8.987 8.987 0 011.06-2.15l7.61 2.15zM7.5 9.95a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acknowledge Report Card Modal */}
      {reportCards.some((r) => !r.parentAcknowledged) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-zxl z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl transform scale-100 transition-transform duration-300">
            <h2 className="font-semibold text-anglican-blue mb-4">Acknowledge Report Card</h2>
            <p className="text-muted/60 mb-6">
              Confirm that you have received and reviewed the report card for
              <strong className="font-medium">{reportCards[0]?.studentName || "—"}</strong>
            </p>

            <p className="text-muted/60 mb-6">
              This helps us keep records of parent engagement with student progress.
            </p>

            <Button
              onClick={() => {
                // Acknowledge the first unreported report card
                const unreported = reportCards.find((r) => !r.parentAcknowledged)
                if (unreported) onAcknowledge(unreported.id)
              }}
              className="w-full mb-3"
            >
              {loading ? (
                <LoadingSpinner className="h-4 w-4 me-2" />
              ) : "Acknowledge"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {}}
              className="w-full"
            >
              Later
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}