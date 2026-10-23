/* School Attendance - SaintsHub School Portal
Provides: Attendance tracking, summary, and marking
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  period: string
  subject: string
}

interface AttendanceSummary {
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  attendancePercentage: number
}

interface AttendanceFilter {
  grade?: string
  status?: string
  searchTerm?: string
}

export function SchoolAttendance() {
  const [filters, setFilters] = useState<AttendanceFilter>({
    grade: "",
    status: "",
    searchTerm: "",
  })
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary>({
    studentId: "",
    studentName: "",
    admissionNumber: "",
    grade: "",
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    attendancePercentage: 0,
  })
  const searchParams = useSearchParams()

  // Initialize filters from URL
  useEffect(() => {
    const grade = searchParams.get("grade") || ""
    const status = searchParams.get("status") || ""
    const searchTerm = searchParams.get("search") || ""
    setFilters({ grade, status, searchTerm })
  }, [searchParams])

  const fetchAttendance = useCallback(async () => {
    const response = await fetch(`/api/school/attendance?institutionId=inst-school-1${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setRecords(data.data.records || [])
    
    // Calculate summary
    const totalDays = (data.data.records || []).length
    const presentDays = (data.data.records || []).filter((r: AttendanceRecord) => r.status === "PRESENT").length
    const absentDays = (data.data.records || []).filter((r: AttendanceRecord) => r.status === "ABSENT").length
    const lateDays = (data.data.records || []).filter((r: AttendanceRecord) => r.status === "LATE").length
    
    setSummary({
      studentId: "",
      studentName: "",
      admissionNumber: "",
      grade: "",
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    })
  }, [searchParams])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const filteredRecords = records.filter((record) => {
    const matchesGrade = filters.grade ? record.grade === filters.grade : true
    const matchesStatus = filters.status ? record.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : record.studentName
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
            record.admissionNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())

    return matchesGrade && matchesStatus && matchesSearch
  })

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value
      setFilters((prev) => ({
        ...prev,
        [e.target.name]: value,
      }))
    },
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, searchTerm: value }))
    },
    []
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          School Attendance
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Student attendance tracking & records
        </p>
      </header>

      {/* Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-sm text-muted/60 mb-1">Grade</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="grade"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Status</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="status"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="EXCUSED">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by name or admission number..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted/60">Total Days</p>
              <p className="font-medium">{summary.totalDays}</p>
            </div>
            <div>
              <p className="text-muted/60">Present</p>
              <p className="font-medium text-success">{summary.presentDays}</p>
            </div>
            <div>
              <p className="text-muted/60">Absent</p>
              <p className="font-medium text-destructive">{summary.absentDays}</p>
            </div>
            <div>
              <p className="text-muted/60">Late</p>
              <p className="font-medium text-anglican-blue">{summary.lateDays}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-dark/30">
            <p className="text-muted/60">Attendance Rate</p>
            <p className="font-medium text-anglican-blue">
              {summary.attendancePercentage}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <p className="text-center text-muted dark:text-muted-foreground py-8">
                No attendance records found. Mark attendance first.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableClassName>Date</TableClassName>
                    <TableCell>Student</TableCell>
                    <TableCell className="text-right">Grade</TableCell>
                    <TableCell className="text-center">Status</TableCell>
                    <TableCell className="text-center">Period/Subject</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-angle/5 dark:hover:bg-angle/80"
                    >
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{record.studentName}</div>
                        <div className="text-xs text-muted/60">{record.admissionNumber}</div>
                      </TableCell>
                      <TableCell className="text-right">{record.grade}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            record.status === "PRESENT"
                              ? "default"
                              : record.status === "ABSENT"
                                ? "destructive"
                                : record.status === "LATE"
                                  ? "secondary"
                                  : "default"
                        }
                        size="sm"
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">{record.period}</div>
                        <div className="text-xs text-muted/60">{record.subject}</div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="link"
                          className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                          aria="Mark attendance"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </CardHeader>
      </Card>

      {/* Mark Attendance Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Student</label>
              <Select defaultValue="" name="student">
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Grade</label>
              <Select defaultValue="" name="grade">
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Date</label>
              <Input
                type="date"
                name="date"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Status</label>
              <Select defaultValue="PRESENT" name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="EXCUSED">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Period</label>
              <Input
                type="number"
                name="period"
                min="1"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Subject</label>
              <Input
                placeholder="e.g., Mathematics, English, Science"
                name="subject"
                className="w-full"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Mark Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}