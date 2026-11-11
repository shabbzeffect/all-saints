/* StaffDirectory - SaintsHub HR Module
 * Live, searchable staff directory — sourced from the institution's real
 * staff/contract/leave records via /api/hr/directory.
 */
"use client"

import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableSkeleton } from "@/components/ui/skeleton"
import { useEffect, useState, useCallback } from "react"

export interface DirectoryStaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  employmentType: string
  employmentTypeName: string
  dateOfJoining: string
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED"
  hasActiveContract: boolean
}

const STATUS_VARIANT: Record<DirectoryStaffMember["status"], "success" | "warning" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  INACTIVE: "secondary",
  TERMINATED: "destructive",
}

export function StaffDirectory() {
  const [staff, setStaff] = useState<DirectoryStaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [status, setStatus] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hr/directory", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(body?.error ?? "Could not load staff directory")
        return
      }
      setStaff(body?.data?.staff ?? [])
    } catch {
      setMessage("Could not load staff directory")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = staff.filter((s) => {
    if (employmentType && s.employmentType !== employmentType) return false
    if (status && s.status !== status) return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q) && !s.role.toLowerCase().includes(q) && !s.phone.includes(q)) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Staff Directory</h2>
        <p className="text-sm text-muted-foreground">Live roster of everyone employed by the institution</p>
      </div>

      {message && (
        <div role="status" className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {message}
        </div>
      )}

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{loading ? "Loading…" : `${filtered.length} Staff Member${filtered.length === 1 ? "" : "s"}`}</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search name, email, role or phone…"
              value={search}
              onValueChange={setSearch}
              className="w-full sm:w-64"
              aria-label="Search staff"
            />
            <Select onValueChange={(e) => setEmploymentType(e.target.value)} defaultValue="" name="employmentType" aria-label="Filter by employment type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="PERMANENT">Permanent &amp; Pensionable</SelectItem>
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
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <TableSkeleton columns={6} rows={8} className="py-3" />
          ) : (
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
                    <TableCell className="text-center text-xs" title={s.employmentTypeName}>{s.employmentType}</TableCell>
                    <TableCell className="text-center text-sm">{new Date(s.dateOfJoining).toLocaleDateString("en-KE", { year: "numeric", month: "short" })}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={STATUS_VARIANT[s.status]} size="sm">{s.status.replace("_", " ")}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No staff match your search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
