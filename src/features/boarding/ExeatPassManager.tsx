/* ExeatPassManager - SaintsHub Boarding Module
 * Submit, review and approve/reject student exeat pass requests
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface ExeatPass {
  id: string
  studentName: string
  admissionNumber: string
  grade: string
  reason: string
  startDate: string
  endDate: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  daysRequested: number
}

const STATUS_VARIANT: Record<ExeatPass["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

export function ExeatPassManager() {
  const [passes, setPasses] = useState<ExeatPass[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [studentName, setStudentName] = useState("")
  const [admissionNumber, setAdmissionNumber] = useState("")
  const [grade, setGrade] = useState("Grade 7")
  const [reason, setReason] = useState("")
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchPasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/boarding/exeat-passes/pending", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      setPasses(body?.data ?? [])
    } catch {
      setPasses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPasses()
  }, [fetchPasses])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/boarding/exeat-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, admissionNumber, grade, reason, startDate, endDate }),
      })
      setMessage(res.ok ? "Exeat pass requested." : "Could not submit request.")
      if (res.ok) {
        setStudentName("")
        setAdmissionNumber("")
        setReason("")
        setEndDate("")
        fetchPasses()
      }
    } catch {
      setMessage("Could not submit request.")
    } finally {
      setSubmitting(false)
    }
  }

  const decidePass = async (passId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/boarding/exeat-passes/approve?id=${encodeURIComponent(passId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedBy: "principal-001" }),
      })
      if (res.ok) {
        setPasses((prev) => prev.map((p) => (p.id === passId ? { ...p, status } : p)))
      }
    } catch {
      // keep list unchanged on failure
    }
  }

  const visible = passes.filter((pass) => {
    if (statusFilter && pass.status !== statusFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!pass.studentName.toLowerCase().includes(q) && !pass.reason.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Exeat Passes</h2>
        <p className="text-sm text-muted-foreground">Permission-to-leave requests for boarders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Exeat Pass</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="studentName" className="mb-1 block text-xs font-medium text-muted-foreground">Student Name</label>
              <Input id="studentName" name="studentName" value={studentName} onValueChange={setStudentName} placeholder="Full name" required />
            </div>
            <div>
              <label htmlFor="admissionNumber" className="mb-1 block text-xs font-medium text-muted-foreground">Admission No.</label>
              <Input id="admissionNumber" name="admissionNumber" value={admissionNumber} onValueChange={setAdmissionNumber} placeholder="e.g. ADM-2024-001" required />
            </div>
            <div>
              <label htmlFor="grade" className="mb-1 block text-xs font-medium text-muted-foreground">Grade</label>
              <Select onValueChange={(e) => setGrade(e.target.value)} defaultValue="Grade 7" name="grade">
                <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 6 }, (_, i) => `Grade ${i + 7}`).map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
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
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="reason" className="mb-1 block text-xs font-medium text-muted-foreground">Reason</label>
              <Input id="reason" name="reason" value={reason} onValueChange={setReason} placeholder="e.g. Family function, medical appointment" required />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={submitting} loading={submitting}>
                {submitting ? "Submitting…" : "Request Pass"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{passes.length} Requests</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search student or reason…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search exeat passes"
            />
            <Select onValueChange={(e) => setStatusFilter(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell>
                    <div className="font-medium">{pass.studentName}</div>
                    <div className="text-xs text-muted-foreground">{pass.admissionNumber} · {pass.grade}</div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{pass.startDate} → {pass.endDate}</TableCell>
                  <TableCell className="max-w-48"><span className="line-clamp-2 text-sm">{pass.reason}</span></TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[pass.status] ?? "secondary"} size="sm">{pass.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {pass.status === "PENDING" ? (
                      <span className="inline-flex gap-2">
                        <Button size="icon" variant="ghost" aria-label="Approve exeat pass" onClick={() => decidePass(pass.id, "APPROVED")}>
                          <Check className="h-4 w-4 text-anglican-green-700" />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Reject exeat pass" onClick={() => decidePass(pass.id, "REJECTED")}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Decided</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No exeat passes found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading passes…</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Approved passes are recorded in the student&rsquo;s boarding file and require the guardian&rsquo;s signature on return.
        </CardContent>
      </Card>
    </div>
  )
}
