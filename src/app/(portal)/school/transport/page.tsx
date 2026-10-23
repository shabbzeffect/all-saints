/* School Transport - SaintsHub School Portal
Provides: Fleet management, route assignments, transport fee tracking
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

export function SchoolTransport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [fees, setFees] = useState<TransportFee[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize from URL filters
  useEffect(() => {
    const status = searchParams.get("status") || ""
    const vehicleType = searchParams.get("vehicleType") || ""
    setFilters({ status, vehicleType, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchVehicles = useCallback(async () => {
    const response = await fetch("/api/transport/vehicles", { cache: "no-store" })
    const data = await response.json()
    setVehicles(data.data || [])
  }, [])

  const fetchRoutes = useCallback(async () => {
    const response = await fetch("/api/transport/routes", { cache: "no-store" })
    const data = await response.json()
    setRoutes(data.data || [])
  }, [])

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
    fetchVehicles()
    fetchRoutes()
    fetchAssignments()
    fetchFees()
  }, [fetchVehicles, fetchRoutes, fetchAssignments, fetchFees])

  const [filters, setFilters] = useState({
    status: "",
    vehicleType: "",
    searchTerm: "",
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

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = filters.status ? vehicle.status === filters.status : true
    const matchesType = filters.vehicleType
      ? vehicle.vehicleType === filters.vehicleType
      : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : vehicle.plateNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        vehicle.manufacturer.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : route.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        route.origin.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        route.destination.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : assignment.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assignment.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assignment.stopName.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : fee.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        fee.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Transport Management
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Fleet, routes & student transport assignments
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
              <label className="text-sm text-muted/60 mb-1">Vehicle Status</label>
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Vehicle Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="vehicleType"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="BUS">Bus</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="CAR">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by plate number, vehicle or student..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles {filteredVehicles.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVehicles.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No vehicles found.
            </p>
          ) : (
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
                {filteredVehicles.map((vehicle) => (
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
                    <TableCell className="text-right font-medium">KSh {vehicle.dailyRate.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Routes Table */}
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

      {/* Assignments Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Active Assignments {assignments.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No assignments found.
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

      {/* Fees Table */}
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