/* ParishGroups - SaintsHub Parish Portal
 * Cell groups, Bible studies and fellowship circles
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface ParishGroup {
  id: string
  name: string
  description?: string
  type: "CELL" | "BIBLE_STUDY" | "PRAYER" | "OUTREACH" | "SOCIAL" | "OTHER"
  leaderName?: string
  leaderPhone?: string
  memberCount: number
  capacity?: number
  meetingSchedule?: string
  location?: string
  status: "ACTIVE" | "INACTIVE" | "DORMANT"
}

const STATUS_VARIANT: Record<ParishGroup["status"], "success" | "secondary" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  DORMANT: "warning",
}

export function ParishGroups() {
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [groups, setGroups] = useState<ParishGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/parish/groups", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((body) => setGroups(body?.data ?? []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [])

  const visible = groups.filter((group) => {
    if (type && group.type !== type) return false
    if (status && group.status !== status) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!group.name.toLowerCase().includes(q) && !(group.description ?? "").toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Parish Groups</h2>
        <p className="text-sm text-muted-foreground">Cell groups, Bible studies and fellowship circles</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{visible.length} Groups</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search groups…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search groups"
            />
            <Select onValueChange={(e) => setType(e.target.value)} defaultValue="" name="type" aria-label="Filter by type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="CELL">Cell Group</SelectItem>
                <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                <SelectItem value="PRAYER">Prayer</SelectItem>
                <SelectItem value="OUTREACH">Outreach</SelectItem>
                <SelectItem value="SOCIAL">Social</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DORMANT">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead>Meeting</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div className="font-medium">{group.name}</div>
                    {group.location && <div className="text-xs text-muted-foreground">{group.location}</div>}
                  </TableCell>
                  <TableCell className="text-center">{group.type.replace("_", " ")}</TableCell>
                  <TableCell>
                    <div className="text-sm">{group.leaderName ?? "—"}</div>
                    {group.leaderPhone && <div className="text-xs text-muted-foreground">{group.leaderPhone}</div>}
                  </TableCell>
                  <TableCell className="text-center">
                    {group.memberCount}{group.capacity != null ? `/${group.capacity}` : ""}
                  </TableCell>
                  <TableCell className="text-sm">{group.meetingSchedule ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[group.status] ?? "secondary"} size="sm">{group.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No groups found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading groups…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
