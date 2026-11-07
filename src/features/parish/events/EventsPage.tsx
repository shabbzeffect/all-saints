/* EventsPage.tsx
 * Parish - Events, with type/status filters and capacity tracking
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface ParishEvent {
  id: string
  title: string
  description?: string
  type: "service" | "meeting" | "celebration" | "workshop" | string
  status: "draft" | "published" | "completed" | string
  date?: string
  startDate?: string
  location?: string
  registeredCount?: number
  totalSlots?: number
}

const TYPE_VARIANT: Record<string, "primary" | "secondary" | "warning" | "info"> = {
  service: "primary",
  meeting: "secondary",
  celebration: "warning",
  workshop: "info",
}

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [events, setEvents] = useState<ParishEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/parish/events${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => setEvents(data.events ?? data.data ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [searchTerm])

  const visible = events.filter((event) => {
    if (type && event.type !== type) return false
    if (status && event.status !== status) return false
    return true
  })

  const eventDate = (event: ParishEvent) => {
    const raw = event.date ?? event.startDate
    if (!raw) return "—"
    const parsed = new Date(raw)
    return Number.isNaN(parsed.getTime()) ? raw : parsed.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Parish Events</h2>
        <p className="text-sm text-muted-foreground">Services, meetings and celebrations across the parish</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{visible.length} Events</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search events…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search events"
            />
            <Select onValueChange={(e) => setType(e.target.value)} defaultValue="" name="type" aria-label="Filter by type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">RSVPs</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="font-medium">{event.title}</div>
                    {event.description && <div className="line-clamp-1 text-xs text-muted-foreground">{event.description}</div>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={TYPE_VARIANT[event.type] ?? "secondary"} size="sm">{event.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{eventDate(event)}</TableCell>
                  <TableCell>{event.location ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    {event.totalSlots != null ? `${event.registeredCount ?? 0}/${event.totalSlots}` : (event.registeredCount ?? "—")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={event.status === "published" ? "success" : event.status === "completed" ? "secondary" : "warning"} size="sm">
                      {event.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No events found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading events…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
