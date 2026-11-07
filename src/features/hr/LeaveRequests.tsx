/* LeaveManagement - SaintsHub HR Module
 * Leave types, entitlement balances, new-request form and request history
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface LeaveType {
  key: string
  name: string
  daysPerYear: number
}

interface LeaveRequest {
  id: string
  leaveType: { key: string; name: string; daysPerYear: number } | string
  startDate: string
  endDate: string
  daysRequested: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  staffName?: string
}

const STATUS_VARIANT: Record<LeaveRequest["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

export function LeaveManagement() {
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [daysRequested, setDaysRequested] = useState("1")
  const [reason, setReason] = useState("")

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [typesRes, requestsRes] = await Promise.all([
        fetch("/api/hr?action=leave-types", { cache: "no-store" }),
        fetch("/api/hr?action=leave-requests&staffId=staff-001", { cache: "no-store" }),
      ])
      const typesBody = await typesRes.json().catch(() => null)
      const requestsBody = await requestsRes.json().catch(() => null)
      setLeaveTypes(typesBody?.data ?? [])
      setRequests(requestsBody?.data ?? [])
    } catch {
      setLeaveTypes([])
      setRequests([])
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const usedDays = (key: string) =>
    requests
      .filter((r) => {
        const lt = r.leaveType
        const rKey = typeof lt === "string" ? lt : lt?.key
        return rKey === key && r.status === "APPROVED"
      })
      .reduce((sum, r) => sum + (r.daysRequested || 0), 0)

  const pendingDays = (key: string) =>
    requests
      .filter((r) => {
        const lt = r.leaveType
        const rKey = typeof lt === "string" ? lt : lt?.key
        return rKey === key && r.status === "PENDING"
      })
      .reduce((sum, r) => sum + (r.daysRequested || 0), 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!leaveTypeId) {
      setMessage("Select a leave type first.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: "staff-001",
          leaveTypeId,
          startDate,
          endDate,
          daysRequested: Number(daysRequested) || 1,
          reason,
        }),
      })
      setMessage(res.ok ? "Leave request submitted for approval." : "Could not submit request.")
      if (res.ok) {
        setLeaveTypeId("")
        setReason("")
        setDaysRequested("1")
        fetchData()
      }
    } catch {
      setMessage("Network error submitting leave request.")
    } finally {
      setLoading(false)
    }
  }

  const leaveTypeName = (lt: LeaveRequest["leaveType"]) => (typeof lt === "string" ? lt : lt?.name ?? "Leave")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Leave Management</h2>
        <p className="text-sm text-muted-foreground">Balances by leave type, new request form and request history</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {leaveTypes.map((lt) => {
          const remaining = Math.max(lt.daysPerYear - usedDays(lt.key) - pendingDays(lt.key), 0)
          return (
            <Card key={lt.key} className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{lt.name}</p>
              <p className="mt-1 text-2xl font-bold">{remaining}<span className="text-sm font-normal text-muted-foreground"> / {lt.daysPerYear}d</span></p>
              <p className="text-xs text-muted-foreground">{pendingDays(lt.key)} pending</p>
            </Card>
          )
        })}
        {!loadingData && leaveTypes.length === 0 && (
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
              <Select onValueChange={(e) => setLeaveTypeId(e.target.value)} defaultValue="" name="leaveType">
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.key} value={lt.key}>{lt.name}</SelectItem>
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
              <label htmlFor="daysRequested" className="mb-1 block text-xs font-medium text-muted-foreground">Days</label>
              <Input id="daysRequested" name="daysRequested" type="number" min={1} value={daysRequested} onValueChange={setDaysRequested} required />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="reason" className="mb-1 block text-xs font-medium text-muted-foreground">Reason</label>
              <Input id="reason" name="reason" value={reason} onValueChange={setReason} placeholder="e.g. Family wedding, medical appointment" />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Submitting…" : "Submit Request"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead className="text-center">Period</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{leaveTypeName(r.leaveType)}</TableCell>
                  <TableCell className="text-center text-sm">
                    {new Date(r.startDate).toLocaleDateString("en-KE")} → {new Date(r.endDate).toLocaleDateString("en-KE")}
                  </TableCell>
                  <TableCell className="text-center">{r.daysRequested}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"} size="sm">{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{new Date(r.createdAt).toLocaleDateString("en-KE")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loadingData && requests.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No leave requests yet.</p>
          )}
          {loadingData && <p className="py-8 text-center text-sm text-muted-foreground">Loading leave data…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
