/* Communications - SaintsHub Parish Portal
 * Announcements, events and news across the school and parish wings
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface Communication {
  id: string
  title: string
  type: "ANNOUNCEMENT" | "EVENT" | "NEWS"
  content: string
  author: string
  publishedAt: string
  wing: "SCHOOL" | "PARISH"
  targetAudience: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}

const TYPE_VARIANT: Record<Communication["type"], "primary" | "info" | "secondary"> = {
  ANNOUNCEMENT: "primary",
  EVENT: "info",
  NEWS: "secondary",
}

const STATUS_VARIANT: Record<Communication["status"], "success" | "warning" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "destructive",
}

export function Communications() {
  const [wing, setWing] = useState("PARISH")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ wing })
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (searchTerm) params.set("search", searchTerm)
    fetch(`/api/parish/communications?${params}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((body) => setCommunications(body?.data ?? body?.communications ?? []))
      .catch(() => setCommunications([]))
      .finally(() => setLoading(false))
  }, [wing, type, status, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Communications</h2>
        <p className="text-sm text-muted-foreground">Announcements, events and news for the All Saints family</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{communications.length} Messages</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search title or content…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search communications"
            />
            <Select onValueChange={(e) => setWing(e.target.value)} defaultValue="PARISH" name="wing" aria-label="Filter by wing">
              <SelectTrigger><SelectValue placeholder="Wing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PARISH">Parish</SelectItem>
                <SelectItem value="SCHOOL">School</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setType(e.target.value)} defaultValue="" name="type" aria-label="Filter by type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="NEWS">News</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Audience</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communications.map((comm) => (
                <TableRow key={comm.id}>
                  <TableCell>
                    <div className="font-medium">{comm.title}</div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">{comm.content}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={TYPE_VARIANT[comm.type] ?? "secondary"} size="sm">{comm.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs">{comm.targetAudience}</TableCell>
                  <TableCell className="text-sm">{comm.author}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[comm.status] ?? "secondary"} size="sm">{comm.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {new Date(comm.publishedAt).toLocaleDateString("en-KE")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && communications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No communications found.</p>
          )}
          {loading && <TableSkeleton columns={6} rows={5} />}
        </CardContent>
      </Card>
    </div>
  )
}
