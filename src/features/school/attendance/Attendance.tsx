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
  period: string
  subject: string
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

  const [studentId, setStudentId] = useState("")
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [markStatus, setMarkStatus] = useState("PRESENT")
  const [markPeriod, setMarkPeriod] = useState("")
  const [markSubject, setMarkSubject] = useState("")
  const [markMessage, setMarkMessage] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/school/attendance?institutionId=inst-school-1", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      const list: AttendanceRecord[] = body?.data?.records ?? body?.records ?? []
      setRecords(list)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

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
          institutionId: "inst-school-1",
          studentId,
          date: markDate,
          status: markStatus,
          period: markPeriod,
          subject: markSubject,
        }),
      })
      setMarkMessage(res.ok ? "Attendance recorded." : "Could not record attendance right now.")
      if (res.ok) {
        setStudentId("")
        setMarkPeriod("")
        setMarkSubject("")
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
                {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map((g) => (
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
                <TableHead>Period / Subject</TableHead>
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
                  <TableCell>
                    <span className="text-sm">Period {record.period}</span>
                    <span className="block text-xs text-muted-foreground">{record.subject}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No attendance records found.</p>
          )}
          {loading && <TableSkeleton columns={6} rows={5} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2">
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
            <div>
              <label htmlFor="period" className="mb-1 block text-xs font-medium text-muted-foreground">Period</label>
              <Input id="period" name="period" type="number" min={1} value={markPeriod} onValueChange={setMarkPeriod} placeholder="e.g. 1" />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
              <Input id="subject" name="subject" value={markSubject} onValueChange={setMarkSubject} placeholder="e.g. Mathematics" />
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
