/* MembersPage.tsx
 * Parish - Member directory with search, role and status filters
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  status: string
  dateJoined?: string
}

export function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/parish/members${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { members: [] }))
      .then((data) => setMembers(data.members ?? data.data ?? []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [searchTerm])

  const visible = members.filter((m) => {
    if (role && m.role !== role) return false
    if (status && m.status !== status) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Parish Members</h2>
        <p className="text-sm text-muted-foreground">Baptized members and their roles in the parish family</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{visible.length} Members</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search members…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search members"
            />
            <Select onValueChange={(e) => setRole(e.target.value)} defaultValue="" name="role" aria-label="Filter by role">
              <SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                <SelectItem value="priest">Priest</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="lay">Lay Member</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead className="text-center">Joined</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell>
                    <div className="text-sm">{member.email}</div>
                    <div className="text-xs text-muted-foreground">{member.phone}</div>
                  </TableCell>
                  <TableCell className="text-center capitalize">{member.role}</TableCell>
                  <TableCell className="text-center">
                    {member.dateJoined ? new Date(member.dateJoined).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={member.status === "active" ? "success" : "secondary"} size="sm">
                      {member.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No members found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading members…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
