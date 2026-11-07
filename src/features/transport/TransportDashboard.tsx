/* TransportDashboard - SaintsHub Transport Module
 * Fleet overview, routes, student assignments and transport fees
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bus, Route as RouteIcon, Users, Wallet } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/config"
import { cn } from "@/lib/config"

interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: "BUS" | "VAN" | "CAR"
  capacity: number
  manufacturer?: string
  model?: string
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED"
  dailyRate?: number
}

interface TransportRoute {
  id: string
  name: string
  origin: string
  destination: string
  distanceKm?: number
  status: "ACTIVE" | "INACTIVE"
}

interface Assignment {
  id: string
  studentName: string
  admissionNumber: string
  stopName?: string
  pickupTime?: string
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
}

interface TransportFee {
  id: string
  studentName: string
  admissionNumber: string
  description?: string
  amount: number
  dueDate?: string
  status: "PENDING" | "PAID" | "OVERDUE"
}

type Tab = "vehicles" | "routes" | "assignments" | "fees"

const VEHICLE_STATUS_VARIANT: Record<Vehicle["status"], "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  RETIRED: "destructive",
}

const FEE_STATUS_VARIANT: Record<TransportFee["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
}

export function TransportDashboard() {
  const [tab, setTab] = useState<Tab>("vehicles")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [fees, setFees] = useState<TransportFee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const endpoints = [
        { url: "/api/transport/vehicles", set: setVehicles },
        { url: "/api/transport/routes", set: setRoutes },
        { url: "/api/transport/assignments", set: setAssignments },
        { url: "/api/transport/fees", set: setFees },
      ] as const
      await Promise.all(
        endpoints.map(({ url, set }) =>
          fetch(url, { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((body) => set(body?.data ?? []))
            .catch(() => set([]))
        )
      )
      setLoading(false)
    }
    load()
  }, [])

  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length
  const activeRoutes = routes.filter((r) => r.status === "ACTIVE").length
  const activeAssignments = assignments.filter((a) => a.status === "ACTIVE" || a.status === "SCHEDULED").length
  const pendingFees = fees.filter((f) => f.status !== "PAID").length

  const metrics = [
    { label: "Active Vehicles", value: `${activeVehicles}/${vehicles.length}`, icon: Bus },
    { label: "Active Routes", value: `${activeRoutes}/${routes.length}`, icon: RouteIcon },
    { label: "Assigned Riders", value: activeAssignments, icon: Users },
    { label: "Fees Pending", value: pendingFees, icon: Wallet },
  ]

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "vehicles", label: "Vehicles" },
    { id: "routes", label: "Routes" },
    { id: "assignments", label: "Assignments" },
    { id: "fees", label: "Fees" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Transport</h2>
        <p className="text-sm text-muted-foreground">Fleet, routes, rider assignments and fees</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold">{metric.value}</p>
              </div>
              <div className="rounded-lg bg-anglican-blue-50 p-2 text-anglican-blue-700">
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Transport Operations</CardTitle>
          <div role="tablist" aria-label="Transport sections" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {tab === "vehicles" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Daily Rate</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.plateNumber}</TableCell>
                    <TableCell className="text-center">{v.vehicleType}</TableCell>
                    <TableCell className="text-center">{v.capacity}</TableCell>
                    <TableCell>{[v.manufacturer, v.model].filter(Boolean).join(" ") || "—"}</TableCell>
                    <TableCell className="text-right">{v.dailyRate != null ? formatCurrency(v.dailyRate) : "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={VEHICLE_STATUS_VARIANT[v.status] ?? "secondary"} size="sm">{v.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === "routes" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-center">Distance</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.origin}</TableCell>
                    <TableCell>{r.destination}</TableCell>
                    <TableCell className="text-center">{r.distanceKm != null ? `${r.distanceKm} km` : "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={r.status === "ACTIVE" ? "success" : "secondary"} size="sm">{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === "assignments" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead className="text-center">Pickup</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.studentName}</div>
                      <div className="text-xs text-muted-foreground">{a.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{a.stopName ?? "—"}</TableCell>
                    <TableCell className="text-center">{a.pickupTime ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={a.status === "ACTIVE" ? "success" : a.status === "SCHEDULED" ? "info" : "secondary"} size="sm">
                        {a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === "fees" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-medium">{f.studentName}</div>
                      <div className="text-xs text-muted-foreground">{f.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{f.description ?? "Transport fee"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(f.amount)}</TableCell>
                    <TableCell className="text-center">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={FEE_STATUS_VARIANT[f.status] ?? "secondary"} size="sm">{f.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading transport data…</p>}
          {!loading &&
            ((tab === "vehicles" && vehicles.length === 0) ||
              (tab === "routes" && routes.length === 0) ||
              (tab === "assignments" && assignments.length === 0) ||
              (tab === "fees" && fees.length === 0)) && (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing to show here yet.</p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
