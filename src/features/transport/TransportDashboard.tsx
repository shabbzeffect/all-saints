/* Transport Dashboard - SaintsHub Transport Module
Provides: Vehicle management, route assignments, fee tracking
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: "BUS" | "VAN" | "CAR"
  capacity: number
  manufacturer: string
  model: string
  year: number
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED"
  dailyRate: number
}

interface Route {
  id: string
  name: string
  origin: string
  destination: string
  waypoints: string[]
  distanceKm: number
  estimatedTimeMinutes: number
  status: "ACTIVE" | "INACTIVE"
  assignedVehicleId?: string
}

interface Assignment {
  id: string
  routeId: string
  vehicleId: string
  studentId: string
  studentName: string
  admissionNumber: string
  stopId: string
  stopName: string
  pickupTime: string
  dropoffTime: string
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  pickupDate: string
  dropoffDate: string
}

interface TransportFee {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  feeType: "MONTHLY" | "TERM" | "ANNUAL" | "PER_TRIP"
  description: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
}

interface DashboardStats {
  totalVehicles: number
  activeVehicles: number
  activeAssignments: number
  pendingFees: number
}

interface ReturnRecord {
  id: string
  loanId: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  borrowedDate: string
  dueDate: string
  returnDate: string
  fineAmount: number
  fineStatus: "PAID" | "UNPAID" | "WAIVED"
  processedBy: string
  processedAt: string
}

interface LibraryStats {
  totalBooks: number
  totalMembers: number
  activeLoans: number
  overdueItems: number
  totalReturns: number
  returnedFineTotal: number
}

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Transport Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Fleet management, routes & student assignments
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 rounded-lg border border-border-dark/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Total Vehicles</p>
              <p className="font-bold text-2xl">{stats.totalVehicles}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Active</p>
              <p className="font-bold text-2xl text-success">{stats.activeVehicles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-lg border border-border-dark/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Active Routes</p>
              <p className="font-bold text-2xl">{routes.filter((r) => r.status === "ACTIVE").length}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Active Assignments</p>
              <p className="font-bold text-2xl text-success">{stats.activeAssignments}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-lg border border-border-dark/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Pending Fees</p>
              <p className="font-bold text-2xl text-destructive">KSh {stats.pendingFees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Total Fleet Value</p>
              <p className="font-bold text-2xl">KSh {totalDailyRate.toLocaleString()}/day</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Vehicles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles {vehicles.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Plate Number</TableCell>
                <TableCell className="text-center">Type</TableCell>
                <TableCell className="text-center">Capacity</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell className="text-right">Daily Rate</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{vehicle.plateNumber}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={vehicle.vehicleType === "BUS" ? "default" : vehicle.vehicleType === "VAN" ? "secondary" : "destructive"} size="sm">
                      {vehicle.vehicleType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{vehicle.capacity}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={vehicle.status === "ACTIVE" ? "default" : vehicle.status === "MAINTENANCE" ? "secondary" : "destructive"}
                      size="sm"
                    >
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{vehicle.dailyRate.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Routes Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Routes {routes.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Route Name</TableCell>
                <TableCell className="text-center">Origin</TableCell>
                <TableCell className="text-center">Destination</TableCell>
                <TableCell className="text-center">Distance</TableCell>
                <TableCell className="text-center">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow
                  key={route.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{route.name}</TableCell>
                  <TableCell className="text-center">{route.origin}</TableCell>
                  <TableCell className="text-center">{route.destination}</TableCell>
                  <TableCell className="text-center">{route.distanceKm} km</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={route.status === "ACTIVE" ? "default" : "secondary"} size="sm">
                      {route.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignments Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Active Assignments {assignments.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No active assignments.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell className="text-center">Route</TableCell>
                  <TableCell className="text-center">Vehicle</TableCell>
                  <TableCell className="text-center">Pickup</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow
                    key={assignment.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{assignment.studentName}</div>
                      <div className="text-xs text-muted/60">{assignment.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.routeId}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.vehicleId}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.pickupTime}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={assignment.status === "ACTIVE" ? "default" : assignment.status === "SCHEDULED" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Fees Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Transport Fees {fees.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No transport fees found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Period</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow
                    key={fee.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{fee.studentName}</div>
                      <div className="text-xs text-muted/60">{fee.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">KSh {fee.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{fee.period}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={fee.status === "PENDING" ? "secondary" : fee.status === "PAID" ? "default" : "destructive"}
                        size="sm"
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}