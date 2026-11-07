/* BoardingDashboard - SaintsHub School Portal
 * Dormitory overview: occupancy, capacity and status
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BedDouble, Users, Building2, Percent } from "lucide-react"
import { useEffect, useState } from "react"

interface Dormitory {
  id: string
  name: string
  type: "BOYS" | "GIRLS" | "MIXED"
  wing: "SCHOOL" | "PARISH"
  capacity: number
  currentOccupancy: number
  isActive: boolean
}

export function BoardingDashboard() {
  const [dormitories, setDormitories] = useState<Dormitory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/boarding/dormitories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setDormitories(body?.data ?? body?.dormitories ?? []))
      .catch(() => setDormitories([]))
      .finally(() => setLoading(false))
  }, [])

  const totalCapacity = dormitories.reduce((sum, d) => sum + d.capacity, 0)
  const totalOccupancy = dormitories.reduce((sum, d) => sum + d.currentOccupancy, 0)
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0
  const activeDormitories = dormitories.filter((d) => d.isActive).length

  const metrics = [
    { label: "Boarders", value: totalOccupancy, icon: Users },
    { label: "Total Capacity", value: totalCapacity, icon: BedDouble },
    { label: "Occupancy Rate", value: `${overallOccupancyRate}%`, icon: Percent },
    { label: "Active Dormitories", value: activeDormitories, icon: Building2 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Boarding Overview</h2>
        <p className="text-sm text-muted-foreground">Dormitory occupancy across the school</p>
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
        <CardHeader>
          <CardTitle>Dormitories</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dormitory</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Occupied</TableHead>
                <TableHead className="text-center">Occupancy</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dormitories.map((dorm) => {
                const rate = dorm.capacity > 0 ? Math.round((dorm.currentOccupancy / dorm.capacity) * 100) : 0
                return (
                  <TableRow key={dorm.id}>
                    <TableCell>
                      <div className="font-medium">{dorm.name}</div>
                      <div className="text-xs text-muted-foreground">{dorm.wing} wing</div>
                    </TableCell>
                    <TableCell className="text-center">{dorm.type}</TableCell>
                    <TableCell className="text-center">{dorm.currentOccupancy}/{dorm.capacity}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={rate >= 100 ? "destructive" : rate >= 80 ? "warning" : "success"} size="sm">
                        {rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={dorm.isActive ? "success" : "secondary"} size="sm">
                        {dorm.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {!loading && dormitories.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No dormitories configured yet.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading dormitories…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
