/* Parent Transport - SaintsHub Parent Portal
Provides: View child's transport assignments, fees, request changes
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

interface ParentTransportAssignment {
  id: string
  studentName: string
  admissionNumber: string
  grade: string
  routeName: string
  vehiclePlate: string
  pickupTime: string
  dropoffTime: string
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  pickupDate: string
  dropoffDate: string
}

interface ParentTransportFee {
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

export function ParentTransport() {
  const [filters, setFilters] = useState({
    status: "",
    searchTerm: "",
  })
  const [assignments, setAssignments] = useState<ParentTransportAssignment[]>([])
  const [fees, setFees] = useState<ParentTransportFee[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize from URL
  useEffect(() => {
    const status = searchParams.get("status") || ""
    setFilters({ status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchAssignments = useCallback(async () => {
    const response = await fetch("/api/transport/assignments", { cache: "no-store" })
    const data = await response.json()
    setAssignments(data.data || [])
  }, [])

  const fetchFees = useCallback(async () => {
    const response = await fetch("/api/transport/fees", { cache: "no-store" })
    const data = await response.json()
    setFees(data.data || [])
  }, [])

  useEffect(() => {
    fetchAssignments()
    fetchFees()
  }, [fetchAssignments, fetchFees])

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesStatus = filters.status ? assignment.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : assignment.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assignment.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : fee.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        fee.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value
      setFilters((prev) => ({
        ...prev,
        [e.target.name]: value,
      }))
    },
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, searchTerm: value }))
    },
    []
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Transport Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          {assignments.length > 0 ? assignments[0].studentName : "Your child's"} transport overview
        </p>
      </header>

      {/* Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-sm text-muted/60 mb-1">Status</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="status"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by name or admission number..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Assignments {assignments.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No transport assignments found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Assignment</TableCell>
                  <TableCell className="text-center">Route</TableCell>
                  <TableCell className="text-center">Vehicle</TableCell>
                  <TableCell className="text-center">Times</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow
                    key={assignment.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{assignment.studentName}</div>
                      <div className="text-xs text-muted/60">{assignment.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.routeName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.vehiclePlate}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.pickupTime} - {assignment.dropoffTime}</div>
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

      {/* Fees */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Transport Fees {fees.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFees.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No transport fees found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Fee</TableCell>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Period</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
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

      {/* Action Buttons */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="primary"
              onClick={() => router.push("/parent/transport/request-change")}
            >
              Request Transport Change
            </Button>
            <Button
              variant="default"
              onClick={() => router.push("/parent/transport/fees")}
            >
              View Billing
            </Button>
            <Button
              variant="link"
              onClick={() => router.push("/parent/transport/passes")}
            >
              View Pass History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}