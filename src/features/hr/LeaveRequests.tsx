/* LeaveManagement - SaintsHub HR Module
 * Real leave: your balances per type, new request, own history, plus an admin
 * approval queue for staff who hold portal:admin:write.
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Loader2, Check, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface LeaveType {
  id: string
  key: string
  name: string
  daysPerYear: number
  isPaid: boolean
  carryOverCap: number
}

interface Balance {
  id: string
  key: string
  name: string
  daysPerYear: number
  isPaid: boolean
  carryOverCap: number
  adjustment: number
  carried: number
  adjusted: number
  used: number
  pending: number
  remaining: number
}

interface AdjustmentRow {
  id: string
  staffId: string
  staffName: string
  leaveType: { key: string; name: string }
  year: number
  delta: number
  reason: string
  createdAt: string
}

interface DirectoryStaff {
  id: string
  name: string
  role: string
}

interface LeaveRow {
  id: string
  staffId: string
  staffName: string
  staffRole: string | null
  leaveType: { key: string; name: string; isPaid: boolean }
  startDate: string
  endDate: string
  daysRequested: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  reason: string | null
  createdAt: string
}

interface Overview {
  balances: Balance[]
  requests: LeaveRow[]
  pendingApprovals: LeaveRow[]
  types: LeaveType[]
  isAdmin: boolean
}

interface AdjustmentForm {
  staffId: string
  leaveTypeId: string
  year: string
  delta: string
  reason: string
}

const STATUS_VARIANT: Record<LeaveRow["status"], "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
}

export function LeaveManagement() {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [adjustments, setAdjustments] = useState<AdjustmentRow[]>([])
  const [staffOptions, setStaffOptions] = useState<DirectoryStaff[]>([])
  const [adj, setAdj] = useState<AdjustmentForm>({
    staffId: "",
    leaveTypeId: "",
    year: String(new Date().getFullYear()),
    delta: "",
    reason: "",
  })
  const [typeCaps, setTypeCaps] = useState<Record<string, string>>({})
  const [adminBusy, setAdminBusy] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [daysRequested, setDaysRequested] = useState("")
  const [reason, setReason] = useState("")

  const loadAdminData = useCallback(async (types: LeaveType[]) => {
    try {
      const [adjRes, dirRes] = await Promise.all([
        fetch("/api/hr/leave/adjustments", { cache: "no-store" }),
        fetch("/api/hr/directory", { cache: "no-store" }),
      ])
      const adjBody = await adjRes.json().catch(() => null)
      const dirBody = await dirRes.json().catch(() => null)
      setAdjustments(adjBody?.data ?? [])
      setStaffOptions(dirBody?.data?.staff ?? [])
      const caps: Record<string, string> = {}
      for (const t of types) caps[t.id] = String(t.carryOverCap)
      setTypeCaps(caps)
    } catch {
      setAdjustments([])
      setStaffOptions([])
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const res = await fetch("/api/hr/leave", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(body?.error ?? "Could not load leave data")
        return
      }
      setOverview(body.data)
      if (body?.data?.isAdmin) {
        loadAdminData(body.data.types ?? [])
      }
    } catch {
      setMessage("Network error loading leave data.")
    } finally {
      setLoadingData(false)
    }
  }, [loadAdminData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!leaveTypeId) {
      setMessage("Select a leave type first.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const payload: any = { leaveTypeId, startDate, endDate, reason: reason.trim() || undefined }
      const parsedDays = parseFloat(daysRequested)
      if (Number.isFinite(parsedDays) && parsedDays > 0) payload.daysRequested = parsedDays

      const res = await fetch("/api/hr/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => null)
      setMessage(body?.message ?? body?.error ?? (res.ok ? "Leave request submitted." : "Could not submit request."))
      if (res.ok) {
        setLeaveTypeId("")
        setReason("")
        setDaysRequested("")
        fetchData()
      }
    } catch {
      setMessage("Network error submitting leave request.")
    } finally {
      setLoading(false)
    }
  }

  const requestAction = async (id: string, action: "approve" | "reject" | "cancel") => {
    setActionBusy(`${id}:${action}`)
    setMessage(null)
    try {
      const res = await fetch(`/api/hr/leave/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const body = await res.json().catch(() => null)
      setMessage(body?.message ?? body?.error ?? `Request ${action}d`)
      await fetchData()
    } catch {
      setMessage("Network error updating leave request.")
    } finally {
      setActionBusy(null)
    }
  }

  const balances = overview?.balances ?? []
  const requests = overview?.requests ?? []
  const pending = overview?.pendingApprovals ?? []
  const types = overview?.types ?? []

  const submitAdjustment = async () => {
    setAdminBusy("adjustment")
    setMessage(null)
    try {
      const delta = parseFloat(adj.delta)
      if (!adj.staffId || !adj.leaveTypeId || !Number.isFinite(delta) || delta === 0 || !adj.reason.trim()) {
        setMessage("Staff, type, non-zero delta and reason are required.")
        return
      }
      const year = parseInt(adj.year, 10)
      const res = await fetch("/api/hr/leave/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: adj.staffId, leaveTypeId: adj.leaveTypeId, year, delta, reason: adj.reason.trim() }),
      })
      const body = await res.json().catch(() => null)
      setMessage(body?.message ?? body?.error ?? (res.ok ? "Adjustment applied." : "Could not apply adjustment."))
      if (res.ok) {
        setAdj({ ...adj, delta: "", reason: "" })
        setOverview((prev) => prev) // refresh balances
        fetchData()
        loadAdminData(types)
      }
    } finally {
      setAdminBusy(null)
    }
  }

  const removeAdjustment = async (id: string) => {
    setAdminBusy(`del:${id}`)
    setMessage(null)
    try {
      const res = await fetch("/api/hr/leave/adjustments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const body = await res.json().catch(() => null)
      setMessage(body?.message ?? body?.error ?? (res.ok ? "Adjustment removed." : "Could not remove adjustment."))
      if (res.ok) {
        fetchData()
        loadAdminData(types)
      }
    } finally {
      setAdminBusy(null)
    }
  }

  const saveTypeCap = async (typeId: string) => {
    setAdminBusy(`cap:${typeId}`)
    setMessage(null)
    try {
      const carryOverCap = parseFloat(typeCaps[typeId] ?? "0")
      if (!Number.isFinite(carryOverCap) || carryOverCap < 0 || carryOverCap > 60) {
        setMessage("Carry-over cap must be between 0 and 60 days.")
        return
      }
      const res = await fetch("/api/hr/leave/types", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: typeId, carryOverCap }),
      })
      const body = await res.json().catch(() => null)
      setMessage(body?.message ?? body?.error ?? (res.ok ? "Carry-over cap updated." : "Could not update carry-over cap."))
      if (res.ok) {
        fetchData()
        loadAdminData(types)
      }
    } finally {
      setAdminBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Leave Management</h2>
        <p className="text-sm text-muted-foreground">Your balances per leave type, a new request, your history{overview?.isAdmin ? ", and the approval queue" : ""}.</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {balances.map((lt) => (
          <Card key={lt.id} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{lt.name}</p>
            <p className="mt-1 text-2xl font-bold">
              {lt.isPaid ? (
                <>
                  {lt.remaining}
                  <span className="text-sm font-normal text-muted-foreground"> / {lt.adjusted}d</span>
                </>
              ) : (
                <>
                  {lt.used}
                  <span className="text-sm font-normal text-muted-foreground">d used</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {lt.isPaid ? (
                <>
                  {lt.pending} pending
                  {lt.carried > 0 ? ` Â· +${lt.carried}d carried` : ""}
                  {lt.adjustment !== 0 ? ` Â· ${lt.adjustment > 0 ? "+" : ""}${lt.adjustment}d adj.` : ""}
                </>
              ) : (
                "unpaid â€” reduces pay"
              )}
            </p>
          </Card>
        ))}
        {!loadingData && balances.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">Leave types unavailable.</p>
        )}
      </div>

      {/* New request */}
      <Card>
        <CardHeader>
          <CardTitle>New Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="leaveType" className="mb-1 block text-xs font-medium text-muted-foreground">Leave Type</label>
              <Select onValueChange={(e) => setLeaveTypeId(e.target.value)} value={leaveTypeId} name="leaveType" aria-label="Leave type">
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {types.map((lt) => (
                    <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="startDate" className="mb-1 block text-xs font-medium text-muted-foreground">Start Date</label>
              <Input id="startDate" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="endDate" className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
              <Input id="endDate" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="daysRequested" className="mb-1 block text-xs font-medium text-muted-foreground">Days (auto)</label>
              <Input id="daysRequested" name="daysRequested" type="number" min={0.5} step={0.5} value={daysRequested} onChange={(e) => setDaysRequested(e.target.value)} placeholder="auto" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="reason" className="mb-1 block text-xs font-medium text-muted-foreground">Reason</label>
              <Input id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family wedding, medical appointment" />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {loading ? "Submittingâ€¦" : "Submit Request"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin approval queue */}
      {overview?.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Queue{pending.length > 0 ? ` (${pending.length})` : ""}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending requests â€” everything is dealt with.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead className="text-center">Period</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead className="text-right">Decide</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.staffName}</div>
                        <div className="text-xs text-muted-foreground">{r.staffRole ?? ""}</div>
                      </TableCell>
                      <TableCell className="text-sm">{r.leaveType.name}{r.leaveType.isPaid ? "" : " (unpaid)"}</TableCell>
                      <TableCell className="text-center text-sm">
                        {new Date(r.startDate).toLocaleDateString("en-KE")} â€“ {new Date(r.endDate).toLocaleDateString("en-KE")}
                      </TableCell>
                      <TableCell className="text-center">{r.daysRequested}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => requestAction(r.id, "approve")} disabled={actionBusy !== null} aria-label="Approve leave">
                            {actionBusy === `${r.id}:approve` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-anglican-green-700" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => requestAction(r.id, "reject")} disabled={actionBusy !== null} aria-label="Reject leave">
                            {actionBusy === `${r.id}:reject` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Own history */}
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead className="text-center">Period</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Cancel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.leaveType.name}</TableCell>
                  <TableCell className="text-center text-sm">
                    {new Date(r.startDate).toLocaleDateString("en-KE")} â€“ {new Date(r.endDate).toLocaleDateString("en-KE")}
                  </TableCell>
                  <TableCell className="text-center">{r.daysRequested}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[r.status]} size="sm">{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "PENDING" && (
                      <Button variant="ghost" size="sm" onClick={() => requestAction(r.id, "cancel")} disabled={actionBusy !== null}>
                        {actionBusy === `${r.id}:cancel` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loadingData && requests.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">You have not requested any leave yet.</p>
          )}
          {loadingData && <TableSkeleton columns={5} rows={6} />}
        </CardContent>
      </Card>

      {/* Admin: balance adjustments + carry-over settings */}
      {overview?.isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Balance adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Credit or debit individual staff leave balances for this year. Adjustments are visible to the staff member and recorded in the audit log.</p>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
                <div className="lg:col-span-2">
                  <label htmlFor="adj-staff" className="mb-1 block text-xs font-medium text-muted-foreground">Staff member</label>
                  <Select value={adj.staffId} onValueChange={(e) => setAdj({ ...adj, staffId: e.target.value })} aria-label="Staff member">
                    <SelectTrigger><SelectValue placeholder="Select staffâ€¦" /></SelectTrigger>
                    <SelectContent>
                      {staffOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} â€” {s.role ?? "Staff"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="adj-type" className="mb-1 block text-xs font-medium text-muted-foreground">Leave type</label>
                  <Select value={adj.leaveTypeId} onValueChange={(e) => setAdj({ ...adj, leaveTypeId: e.target.value })} aria-label="Leave type">
                    <SelectTrigger><SelectValue placeholder="Typeâ€¦" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="adj-year" className="mb-1 block text-xs font-medium text-muted-foreground">Year</label>
                  <Input id="adj-year" type="number" min={2000} max={2100} value={adj.year} onChange={(e) => setAdj({ ...adj, year: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="adj-delta" className="mb-1 block text-xs font-medium text-muted-foreground">Days (+/-)</label>
                  <Input id="adj-delta" type="number" step={0.5} value={adj.delta} onChange={(e) => setAdj({ ...adj, delta: e.target.value })} placeholder="e.g. 3 or -2" inputMode="decimal" />
                </div>
                <div className="flex items-end">
                  <Button onClick={submitAdjustment} disabled={adminBusy !== null} className="w-full">
                    {adminBusy === "adjustment" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    Apply adjustment
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="adj-reason" className="mb-1 block text-xs font-medium text-muted-foreground">Reason (required)</label>
                <Input id="adj-reason" value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} placeholder="e.g. Good attendance â€” 3 extra days annual leave" maxLength={300} />
              </div>
              {adjustments.length > 0 && (
                <div className="overflow-x-auto border-t border-border pt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="pb-2 pr-3">Staff</th>
                        <th className="pb-2 pr-3">Type</th>
                        <th className="pb-2 pr-3">Year</th>
                        <th className="pb-2 pr-3">Days</th>
                        <th className="pb-2 pr-3">Reason</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {adjustments.map((a) => (
                        <tr key={a.id} className="border-t border-border/60">
                          <td className="py-1.5 pr-3 font-medium">{a.staffName}</td>
                          <td className="py-1.5 pr-3">{a.leaveType.name}</td>
                          <td className="py-1.5 pr-3 tabular-nums">{a.year}</td>
                          <td className={`py-1.5 pr-3 tabular-nums font-semibold ${a.delta >= 0 ? "text-anglican-green-700" : "text-destructive"}`}>
                            {a.delta >= 0 ? "+" : ""}{a.delta}
                          </td>
                          <td className="py-1.5 pr-3 text-muted-foreground">{a.reason}</td>
                          <td className="py-1.5 text-right">
                            <Button variant="ghost" size="sm" onClick={() => removeAdjustment(a.id)} disabled={adminBusy !== null} aria-label="Remove adjustment">
                              {adminBusy === `del:${a.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-destructive" />}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carry-over settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                How many unused days roll into the next year, per type. Balances already include carry-over from last year automatically.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {types.map((t) => (
                  <div key={t.id} className="flex items-end gap-2 rounded-md border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`cap-${t.id}`} className="text-xs font-medium text-muted-foreground">{t.name}</label>
                      <Input
                        id={`cap-${t.id}`}
                        type="number"
                        min={0}
                        max={60}
                        step={0.5}
                        value={typeCaps[t.id] ?? "0"}
                        onChange={(e) => setTypeCaps({ ...typeCaps, [t.id]: e.target.value })}
                        className="mt-1"
                        inputMode="decimal"
                        aria-label={`Carry-over cap for ${t.name}`}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => saveTypeCap(t.id)} disabled={adminBusy !== null} aria-label={`Save carry-over cap for ${t.name}`}>
                      {adminBusy === `cap:${t.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

