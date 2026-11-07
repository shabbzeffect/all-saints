/* StaffDirectory - SaintsHub HR Module
 * Searchable staff directory with roles, employment types and status
 */
"use client"

import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export interface DirectoryStaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  employmentType: "PERMANENT" | "CONTRACT" | "DAILY"
  dateOfJoining: string
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED"
}

/* Demo roster (until the HRIS is connected) */
export const DEMO_STAFF: DirectoryStaffMember[] = [
  { id: "STF-001", name: "Mary Achieng", email: "mary.achieng@saintshub.test", phone: "+254 712 345 001", role: "Senior Teacher — Mathematics", employmentType: "PERMANENT", dateOfJoining: "2019-01-14", status: "ACTIVE" },
  { id: "STF-002", name: "John Okoth", email: "john.okoth@saintshub.test", phone: "+254 712 345 002", role: "Teacher — English", employmentType: "PERMANENT", dateOfJoining: "2021-05-03", status: "ACTIVE" },
  { id: "STF-003", name: "Jane Akinyi", email: "jane.akinyi@saintshub.test", phone: "+254 712 345 003", role: "Bursar", employmentType: "CONTRACT", dateOfJoining: "2022-08-22", status: "ON_LEAVE" },
  { id: "STF-004", name: "Peter Mwangi", email: "peter.mwangi@saintshub.test", phone: "+254 712 345 004", role: "Science Teacher", employmentType: "PERMANENT", dateOfJoining: "2017-09-01", status: "ACTIVE" },
  { id: "STF-005", name: "Grace Wanjiru", email: "grace.wanjiru@saintshub.test", phone: "+254 712 345 005", role: "Administrative Assistant", employmentType: "DAILY", dateOfJoining: "2024-02-12", status: "ACTIVE" },
  { id: "STF-006", name: "David Kiptoo", email: "david.kiptoo@saintshub.test", phone: "+254 712 345 006", role: "Teacher — Kiswahili", employmentType: "CONTRACT", dateOfJoining: "2023-01-16", status: "TERMINATED" },
]

const STATUS_VARIANT: Record<DirectoryStaffMember["status"], "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  TERMINATED: "destructive",
}

export function StaffDirectory() {
  const [search, setSearch] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [status, setStatus] = useState("")

  const filtered = DEMO_STAFF.filter((s) => {
    if (employmentType && s.employmentType !== employmentType) return false
    if (status && s.status !== status) return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q) && !s.role.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Staff Directory</h2>
        <p className="text-sm text-muted-foreground">All staff across the school and parish wings</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{filtered.length} Staff Members</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search name, email or role…"
              value={search}
              onValueChange={setSearch}
              className="w-full sm:w-64"
              aria-label="Search staff"
            />
            <Select onValueChange={(e) => setEmploymentType(e.target.value)} defaultValue="" name="employmentType" aria-label="Filter by employment type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="PERMANENT">Permanent</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="DAILY">Daily</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Employment</TableHead>
                <TableHead className="text-center">Joined</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell className="max-w-56"><span className="line-clamp-1 text-sm">{s.role}</span></TableCell>
                  <TableCell className="font-mono text-xs">{s.phone}</TableCell>
                  <TableCell className="text-center text-xs">{s.employmentType}</TableCell>
                  <TableCell className="text-center text-sm">{new Date(s.dateOfJoining).toLocaleDateString("en-KE", { year: "numeric", month: "short" })}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[s.status] ?? "secondary"} size="sm">{s.status.replace("_", " ")}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No staff match your search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
