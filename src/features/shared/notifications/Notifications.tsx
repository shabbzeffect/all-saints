/* Notifications - SaintsHub Staff Notifications
 * Your inbox of campus announcements + (for admins) a broadcast panel.
 * Notification rows are created by leave/payroll events and admin broadcasts.
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { TableSkeleton } from "@/components/ui/skeleton"
import { BellRing, CheckCheck, Megaphone, Loader2, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface NotificationRow {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

const TYPE_VARIANT: Record<string, "info" | "success" | "warning" | "destructive" | "secondary"> = {
  SYSTEM: "info",
  SECURITY: "destructive",
  ACADEMIC: "success",
  DISCIPLINE: "warning",
  FINANCIAL: "secondary",
  GIVING: "success",
  EVENT: "info",
  CONSENT: "secondary",
}

export function Notifications() {
  const [rows, setRows] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [broadcastTitle, setBroadcastTitle] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [audience, setAudience] = useState<"STAFF" | "ADMINS">("STAFF")
  const [sending, setSending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (res.ok) {
        setRows(body?.data ?? [])
      } else {
        setMessage({ tone: "error", text: body?.error ?? "Could not load notifications" })
      }
      const directoryRes = await fetch("/api/shared/rbac/me", { cache: "no-store" }).catch(() => null)
      if (directoryRes?.ok) {
        const me = await directoryRes.json().catch(() => null)
        setIsAdmin(Boolean(me?.data?.permissions?.includes("portal:admin:write")))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markRead = async (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)))
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    }).catch(() => {})
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_all" }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Could not mark notifications read" })
        return
      }
      setRows((prev) => prev.map((r) => ({ ...r, read: true })))
      setMessage({ tone: "info", text: body?.message ?? "All notifications marked read" })
    } finally {
      setMarkingAll(false)
    }
  }

  const broadcast = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setMessage({ tone: "error", text: "Title and message are required." })
      return
    }
    setSending(true)
    setMessage(null)
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "broadcast", audience, title: broadcastTitle.trim(), message: broadcastMessage.trim() }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Could not send broadcast" })
        return
      }
      setMessage({ tone: "info", text: body?.message ?? "Broadcast sent" })
      setBroadcastTitle("")
      setBroadcastMessage("")
      load()
    } finally {
      setSending(false)
    }
  }

  const filtered = rows.filter((r) => {
    if (filter === "unread" && r.read) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!r.title.toLowerCase().includes(q) && !r.message.toLowerCase().includes(q)) return false
    }
    return true
  })

  const unread = rows.filter((r) => !r.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Campus announcements, leave approvals, payslip updates and other notices from the school office.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-md border px-4 py-2 text-sm ${
            message.tone === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-anglican-green-700/30 bg-anglican-green-700/10 text-anglican-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Inbox */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <CardTitle className="flex items-center gap-2">
              Inbox
              {unread > 0 && (
                <Badge variant="destructive" size="sm">{unread} unread</Badge>
              )}
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="search"
                placeholder="Search…"
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="w-full sm:w-48"
                aria-label="Search notifications"
              />
              <Select value={filter} onValueChange={(e) => setFilter(e.target.value as "all" | "unread")} aria-label="Filter notifications">
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll || unread === 0}>
                {markingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />}
                Mark all read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={1} rows={6} className="py-3" />
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center">
                <BellRing className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                <p className="mt-2 font-medium">{filter === "unread" ? "All caught up" : "Nothing here yet"}</p>
                <p className="text-sm text-muted-foreground">Campus news and updates will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((n) => (
                  <li key={n.id}>
                    <button
                      className="flex w-full items-start gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a441]"
                      onClick={() => (n.read ? undefined : markRead(n.id))}
                      aria-label={`${n.read ? "" : "Unread: "}${n.title}`}
                    >
                      {!n.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-anglican-gold-400" aria-hidden="true" /> : <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden="true" />}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={`line-clamp-1 text-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</span>
                          <Badge variant={TYPE_VARIANT[n.type] ?? "secondary"} size="sm">{n.type}</Badge>
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span>
                        <span className="mt-1 block text-xs text-muted-foreground/70">
                          {new Date(n.createdAt).toLocaleString("en-KE")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Broadcast (admins) */}
        {isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-anglican-gold-600" aria-hidden="true" />
                Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Send an announcement to every active member of the institution. Leave approvals and payslip events are already notified automatically.
              </p>
              <form className="space-y-3" onSubmit={broadcast}>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Audience</label>
                  <Select value={audience} onValueChange={(e) => setAudience(e.target.value as "STAFF" | "ADMINS")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">All staff</SelectItem>
                      <SelectItem value="ADMINS">Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="broadcast-title" className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                  <Input
                    id="broadcast-title"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Term ends early this Friday"
                    maxLength={140}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="broadcast-message" className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
                  <Textarea
                    id="broadcast-message"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Details of the announcement…"
                    className="min-h-32"
                    maxLength={2000}
                    required
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full">
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                  {sending ? "Sending…" : `Send to ${audience === "STAFF" ? "all staff" : "administrators"}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                You will be notified automatically when your leave requests are approved or declined,
                when payroll updates, or when the office posts an announcement.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
