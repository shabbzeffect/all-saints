/* Guardians - SaintsHub School Portal
 * Staff/administrator directory with role, status and employment filters
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface Guardian {
  id: string
  name: string
  phone: string
  email: string
  role: "TEACHER" | "ADMIN" | "BURSAR" | "COUNSELOR" | "OTHER"
  employmentType: "PERMANENT" | "CONTRACT" | "DAILY"
  dateOfJoining: string
  status: "ACTIVE" | "INACTIVE" | "TRANSFERRED"
}

const STATUS_VARIANT: Record<Guardian["status"], "success" | "secondary" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  TRANSFERRED: "warning",
}

export function Guardians() {
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/school/guardians", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((body) => setGuardians(body?.data ?? []))
      .catch(() => setGuardians([]))
      .finally(() => setLoading(false))
  }, [])

  const visible = guardians.filter((guardian) => {
    if (role && guardian.role !== role) return false
    if (status && guardian.status !== status) return false
    if (employmentType && guardian.employmentType !== employmentType) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!guardian.name.toLowerCase().includes(q) && !guardian.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">School Staff Directory</h2>
        <p className="text-sm text-muted-foreground">Teachers, administrators and support staff</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{visible.length} Staff Members</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search name or email…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search staff"
            />
            <Select onValueChange={(e) => setRole(e.target.value)} defaultValue="" name="role" aria-label="Filter by role">
              <SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="BURSAR">Bursar</SelectItem>
                <SelectItem value="COUNSELOR">Counselor</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="TRANSFERRED">Transferred</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setEmploymentType(e.target.value)} defaultValue="" name="employmentType" aria-label="Filter by employment type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="PERMANENT">Permanent</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="DAILY">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Employment</TableHead>
                <TableHead className="text-center">Joined</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((guardian) => (
                <TableRow key={guardian.id}>
                  <TableCell className="font-medium">{guardian.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{guardian.email}</div>
                    <div className="text-xs text-muted-foreground">{guardian.phone}</div>
                  </TableCell>
                  <TableCell className="text-center">{guardian.role}</TableCell>
                  <TableCell className="text-center">{guardian.employmentType}</TableCell>
                  <TableCell className="text-center">
                    {guardian.dateOfJoining ? new Date(guardian.dateOfJoining).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[guardian.status] ?? "secondary"} size="sm">
                      {guardian.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No staff found.</p>
          )}
          {loading && <TableSkeleton columns={6} rows={5} />}
        </CardContent>
      </Card>
    </div>
  )
}
