/* AdminDashboard.tsx
 * Admin portal dashboard - main entry point
 * Provides: User management, role management, institution oversight, audit logs
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export function AdminDashboard() {
  const searchParams = useSearchParams()

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
            Admin Dashboard
          </h1>
          <p className="text-muted dark:text-muted-foreground mt-1">
            User management, roles, institutions & audit logs
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats cards would be populated from API */}
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="w-32">User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell className="text-right">Date</TableCell>
                <TableCell className="text-center">Details</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>System</TableCell>
                <TableCell>Login</TableCell>
                <TableCell className="text-right">2024-01-15</TableCell>
                <TableCell className="text-center">View</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Navigation Shortcuts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {}}
              className="w-full justify-center">
              Manage Users
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {}}
              className="w-full justify-center">
              Manage Roles
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {}}
              className="w-full justify-center">
              View Institutions
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {}}
              className="w-full justify-center">
              Audit Logs
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {}}
              className="w-full justify-center">
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

AdminDashboard.displayName = "AdminDashboard"