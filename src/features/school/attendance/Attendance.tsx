/* Attendance - SaintsHub School Portal
 * Provides: Attendance records, summary metrics, mark-attendance form
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface AttendanceRecord {
  id: string
  studentName: string
  admissionNumber: string
  grade: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
}

const STATUS_VARIANT: Record<AttendanceRecord["status"], "success" | "destructive" | "warning" | "secondary"> = {
  PRESENT: "success",
  ABSENT: "destructive",
  LATE: "warning",
  EXCUSED: "secondary",
}

export function Attendance() {
  const [grade, setGrade] = useState("")
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [studentId, setStudentId] = useState("")
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [markStatus, setMarkStatus] = useState("PRESENT")
  const [markMessage, setMarkMessage] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/school/attendance", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || body?.success === false) throw new Error(body?.error ?? "Could not load attendance")
      const list: AttendanceRecord[] = body?.data?.records ?? []
      setRecords(list)
    } catch (e) {
      setRecords([])
      setError(e instanceof Error ? e.message : "Could not load attendance")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const gradeOptions = Array.from(new Set(records.map((r) => r.grade))).sort()

  const visible = records.filter((record) => {
    if (grade && record.grade !== grade) return false
    if (status && record.status !== status) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!record.studentName.toLowerCase().includes(q) && !record.admissionNumber.toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalDays = records.length
  const presentDays = records.filter((r) => r.status === "PRESENT").length
  const absentDays = records.filter((r) => r.status === "ABSENT").length
  const lateDays = records.filter((r) => r.status === "LATE").length
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const handleMarkAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMarking(true)
    setMarkMessage(null)
    try {
      const res = await fetch("/api/school/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          date: markDate,
          status: markStatus,
        }),
      })
      setMarkMessage(res.ok ? "Attendance recorded." : "Could not record attendance right now.")
      if (res.ok) {
        setStudentId("")
        fetchAttendance()
      }
    } catch {
      setMarkMessage("Could not record attendance right now.")
    } finally {
      setMarking(false)
    }
  }

  const summaryCards = [
    { label: "Total Records", value: totalDays, tone: "text-foreground" },
    { label: "Present", value: presentDays, tone: "text-anglican-green-700" },
    { label: "Absent", value: absentDays, tone: "text-destructive" },
    { label: "Late", value: lateDays, tone: "text-anglican-gold-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Attendance</h2>
        <p className="text-sm text-muted-foreground">Daily student attendance across grades</p>
      </div>

      {error && !loading && (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Attendance Records <span className="ml-2 text-sm font-normal text-muted-foreground">{attendancePercentage}% present</span></CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search name or admission no…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search attendance records"
            />
            <Select onValueChange={(e) => setGrade(e.target.value)} defaultValue="" name="grade" aria-label="Filter by grade">
              <SelectTrigger><SelectValue placeholder="All grades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All grades</SelectItem>
                {gradeOptions.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="EXCUSED">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{record.studentName}</div>
                    <div className="text-xs text-muted-foreground">{record.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-center">{record.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[record.status] ?? "secondary"} size="sm">{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No attendance records found.</p>
          )}
          {loading && <TableSkeleton columns={4} rows={5} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="studentId" className="mb-1 block text-xs font-medium text-muted-foreground">Student ID</label>
              <Input id="studentId" name="studentId" value={studentId} onValueChange={setStudentId} placeholder="Student ID or admission number" required />
            </div>
            <div>
              <label htmlFor="date" className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <Input id="date" name="date" type="date" value={markDate} onChange={(e) => setMarkDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="status" className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <Select onValueChange={(e) => setMarkStatus(e.target.value)} defaultValue="PRESENT" name="status">
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="EXCUSED">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-6">
              <Button type="submit" variant="primary" loading={marking} disabled={marking}>
                {marking ? "Saving…" : "Mark Attendance"}
              </Button>
              {markMessage && <p className="ml-3 self-center text-sm text-muted-foreground">{markMessage}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
