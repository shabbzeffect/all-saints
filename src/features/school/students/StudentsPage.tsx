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
import { useEffect, useState } from "react";
import { Users } from "lucide-react"
import { TableSkeleton } from "@/components/ui/skeleton"

import { formatCurrency } from "@/lib/config"

interface Student {
  id: string
  admissionNumber: string
  fullName: string
  grade: string
  class: string
  status: string
  isBoarding: boolean
  feesOutstanding?: number
  dateOfAdmission?: string
}

const GRADES = [
  { value: "PG", label: "Play Group" },
  { value: "PP1", label: "PP1" },
  { value: "PP2", label: "PP2" },
  ...Array.from({ length: 9 }, (_, i) => ({ value: `GRD${i + 1}`, label: `Grade ${i + 1}` })),
]

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ON_LEAVE", label: "On leave" },
  { value: "INACTIVE", label: "Inactive" },
]

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
    if (grade) params.set("grade", grade)
    setLoading(true)
    fetch(`/api/school/students${params.toString() ? `?${params}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { students: [] }))
      .then((data) => setStudents(data.students ?? data.data ?? []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [searchTerm, status, grade])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Students</h2>
        <p className="text-sm text-muted-foreground">Enrolled students across all grades</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Students{loading ? "" : ` (${students.length})`}</CardTitle>
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
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
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
                <TableHead className="text-right">Fees Owed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.admissionNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.fullName}</div>
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
                  <TableCell className="text-right font-medium">
                    {(student.feesOutstanding ?? 0) > 0 ? (
                      <span className="text-destructive">{formatCurrency(student.feesOutstanding ?? 0)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && students.length === 0 && (
            <div className="flex flex-col items-center py-8">
              <Users className="h-6 w-6 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">No students found</p>
              <p className="text-xs text-muted-foreground/70">{searchTerm || grade || status ? "Try clearing a filter." : "No learner records returned."}</p>
            </div>
          )}
          {loading && <TableSkeleton columns={6} rows={5} />}
        </CardContent>
      </Card>
    </div>
  )
}
