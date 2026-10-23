/* SchoolDashboard.tsx
 * School portal dashboard - main entry point
 * Provides: Overview of school operations, quick stats, navigation
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/config"

interface SchoolStats {
  totalStudents: number
  totalTeachers: number
  totalFeesCollected: number
  outstandingBalance: number
}

export function SchoolDashboard() {
  const searchParams = useSearchParams()

  // Fetch stats data
  const fetchStats = async () => {
    const response = await fetch(`/api/school/dashboard${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    return data
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>School Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
            School Dashboard
          </h1>
          <p className="text-muted dark:text-muted-foreground mt-1">
            Overview of school operations & student records
          </p>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Stats cards would go here */}
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="w-24">Student</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell className="text-right">Date</TableCell>
                <TableCell className="text-center">Details</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Activity rows would be populated from API */}
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>Enrolled</TableCell>
                <TableCell className="text-right">2024-01-15</TableCell>
                <TableCell className="text-center">View</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fee Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-sm text-muted/60">Total Collected</span>
              <div className="font-medium">{formatCurrency(1250000)}</div>
            </div>
            <div>
              <span className="text-sm text-muted/60">Outstanding</span>
              <div className="font-medium text-destructive">{formatCurrency(150000)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

SchoolDashboard.displayName = "SchoolDashboard"