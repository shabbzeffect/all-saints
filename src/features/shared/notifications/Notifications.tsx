/* Notifications - SaintsHub Admin
 * Outbound notification center: SMS, email, WhatsApp and in-app messages
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface NotificationRow {
  id: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH"
  recipientType: "STAFF" | "PARENTS" | "STUDENTS" | "MEMBERS" | "ALL"
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED"
  sentAt?: string
  createdAt: string
}

const TYPE_VARIANT: Record<NotificationRow["type"], "info" | "warning" | "success" | "destructive"> = {
  INFO: "info",
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "destructive",
}

const STATUS_VARIANT: Record<NotificationRow["status"], "warning" | "info" | "success" | "destructive"> = {
  PENDING: "warning",
  SENT: "info",
  DELIVERED: "success",
  FAILED: "destructive",
}

export function Notifications() {
  const [status, setStatus] = useState("")
  const [channel, setChannel] = useState("")
  const [recipientType, setRecipientType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (channel) params.set("channel", channel)
    if (recipientType) params.set("recipientType", recipientType)
    if (searchTerm) params.set("search", searchTerm)
    fetch(`/api/shared/notifications${params.toString() ? `?${params}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setNotifications(body?.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [status, channel, recipientType, searchTerm])

  const failed = notifications.filter((n) => n.status === "FAILED").length
  const pending = notifications.filter((n) => n.status === "PENDING").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Messages sent to staff, parents and members</p>
      </div>

      {(failed > 0 || pending > 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-anglican-gold-300 bg-anglican-gold-50 p-3 text-sm text-anglican-gold-900">
          {pending > 0 && <span><strong>{pending}</strong> pending delivery</span>}
          {failed > 0 && <span><strong>{failed}</strong> failed — check provider credentials</span>}
        </div>
      )}

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{notifications.length} Notifications</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search title or message…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search notifications"
            />
            <Select onValueChange={(e) => setChannel(e.target.value)} defaultValue="" name="channel" aria-label="Filter by channel">
              <SelectTrigger><SelectValue placeholder="All channels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All channels</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="IN_APP">In-App</SelectItem>
                <SelectItem value="PUSH">Push</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setRecipientType(e.target.value)} defaultValue="" name="recipientType" aria-label="Filter by audience">
              <SelectTrigger><SelectValue placeholder="All audiences" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All audiences</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="PARENTS">Parents</SelectItem>
                <SelectItem value="STUDENTS">Students</SelectItem>
                <SelectItem value="MEMBERS">Members</SelectItem>
                <SelectItem value="ALL">Everyone</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
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
                <TableHead className="text-center">Channel</TableHead>
                <TableHead className="text-center">Audience</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <div className="font-medium">{n.title}</div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">{n.message}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={TYPE_VARIANT[n.type] ?? "secondary"} size="sm">{n.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs">{n.channel}</TableCell>
                  <TableCell className="text-center text-xs">{n.recipientType}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[n.status] ?? "secondary"} size="sm">{n.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {n.sentAt ? new Date(n.sentAt).toLocaleString("en-KE") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading notifications…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
