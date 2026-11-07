/* StudentsPage.tsx
 * School - Students management page
 * Provides: Student list, search, filter by grade/status, boarder badges
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface Student {
  id: string
  admissionNumber: string
  fullName: string
  grade: string
  class: string
  status: string
  isBoarding: boolean
  dateOfAdmission?: string
}

const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"]

export function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [grade, setGrade] = useState("")
  const [status, setStatus] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (status) params.set("status", status)
    setLoading(true)
    fetch(`/api/school/students${params.toString() ? `?${params}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { students: [] }))
      .then((data) => setStudents(data.students ?? data.data ?? []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [searchTerm, status])

  const visible = students.filter((s) => !grade || s.grade === grade)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Students</h2>
        <p className="text-sm text-muted-foreground">Enrolled students across all grades</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Students</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search by name or admission no…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-64"
              aria-label="Search students"
            />
            <Select onValueChange={(e) => setGrade(e.target.value)} defaultValue="" name="grade" aria-label="Filter by grade">
              <SelectTrigger><SelectValue placeholder="All Grades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adm No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Residence</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.admissionNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.fullName}</div>
                    <div className="text-xs text-muted-foreground">{student.class}</div>
                  </TableCell>
                  <TableCell className="text-center">{student.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={student.isBoarding ? "primary" : "secondary"} size="sm">
                      {student.isBoarding ? "Boarding" : "Day"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={student.status === "active" ? "success" : "secondary"} size="sm">
                      {student.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {searchTerm || grade || status ? "No students match your filters." : "No students yet. Student records will appear here once connected to the student information system."}
            </p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading students…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
