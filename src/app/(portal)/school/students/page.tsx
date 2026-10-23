/* School Students - SaintsHub School Portal
Provides: Student list, search, enrollment, and basic student information
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/spinner"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

interface Student {
  id: string
  admissionNumber: string
  fullName: string
  grade: string
  stream: string
  section: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED"
  admissionDate: string
  isBoarding: boolean
  parentContact: string
  photoUrl?: string
}

interface StudentsProps {
  students: Student[]
  onNavigate: (path: string) => void
  onViewStudent: (studentId: string) => void
}

interface SearchFilters {
  grade: string
  stream: string
  status: string
  searchTerm: string
}

export function Students({ students, onNavigate, onViewStudent }: StudentsProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    grade: "",
    stream: "",
    status: "",
    searchTerm: "",
  })
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL search params
  useEffect(() => {
    const grade = searchParams.get("grade") || ""
    const stream = searchParams.get("stream") || ""
    const status = searchParams.get("status") || ""
    const searchTerm = searchParams.get("search") || ""
    setFilters({ grade, stream, status, searchTerm })
  }, [searchParams])

  const filteredStudents = students.filter((student) => {
    const matchesGrade = filters.grade ? student.grade === filters.grade : true
    const matchesStream =
      filters.stream ? student.stream === filters.stream : true
    const matchesStatus = filters.status ? student.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : student.fullName
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
            student.admissionNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())

    return matchesGrade && matchesStream && matchesStatus && matchesSearch
  })

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    onNavigate(`/school/student/${student.id}`)
  }

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Students
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          School student directory & enrollment
        </p>
      </header>

      {/* Search and Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <label className="text-sm text-muted/60 mb-1">Stream</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="stream"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All streams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Stream A">Stream A</SelectItem>
                  <SelectItem value="Stream B">Stream B</SelectItem>
                  <SelectItem value="Stream MAIN">Stream MAIN</SelectItem>
                  <SelectItem value="Stream SUPPORT">Stream SUPPORT</SelectItem>
                  <SelectItem value="Stream ACCELERATED">Stream ACCELERATED</SelectItem>
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
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

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <p className="text-center text-muted dark:text-muted-foreground py-8">
                No students found. Add students first.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableClassName>Adm No.</TableClassName>
                    <TableCell>Student</TableCell>
                    <TableCell className="text-right">Grade/Stream</TableCell>
                    <TableCell className="text-center">Status</TableCell>
                    <TableCell className="text-right">Balance</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-angle/5 dark:hover:bg-angle/80"
                      onClick={() => handleViewStudent(student)}
                    >
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-xs text-muted/60">
                          {student.grade} {student.stream} {student.section}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={student.status === "ACTIVE" ? "default" : "destructive"}
                          size="sm"
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {student.isBoarding
                          ? KSh Math.max(0, student.feeBalance).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="link"
                          size="icon"
                          aria-label="View student details"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M3 4h12v3H3V4zm5 3h6v2h-6V7zm5 3h3v2h-3v-2zm-6-6v2h6v-2H3zm6.34 3.34a.75.75 0 01-.72.46l-1.06 1.3a1.5 1.5 0 01-.55.18H3.5a1.5 1.5 0 01-.55-.18l-1.06-1.3a.75.75 0 01-.02-.67l1.34-1.57.92-.88a.75.75 0 01.66.22l1.56 1.81 1.33-1.52.89-.87a.75.75 0 01.26-.16.75.75 0 00-.28-.65l-1.56-1.81-1.33 1.52-.89.87a.75.75 0 01-.26.16l-.55.68-.93.88a.75.75 0 01-.66-.22l-1.34 1.57-.92.88a.75.75 0 01-.02.67l1.06 1.3a1.5 1.5 0 01.55.18h.55a1.5 1.5 0 01.55-.18l1.06-1.3a.75.75 0 01.02-.67l-1.34 1.57-.92-.88a.75.75 0 01-.66.22l-1.34-1.57.92.88a.75.75 0 01.26.16l.55-.68.93-.88a.75.75 0 01.66-.22l1.34-1.57 1.92.88a.75.75 0 01.66.22l1.33 1.52.89-.88a.75.75 0 01.26.16.75.75 0 00-.28.65l1.56 1.81 1.33 1.52.89.87a.75.75 0 01.26-.16l-.55-.68.93.88a.75.75 0 01.66.22l1.34 1.57.92-.88a.75.75 0 01.66-.22l-1.34 1.57-.92-.88a.75.75 0 01-.26-.16l-.55.68-.93-.88a.75.75 0 01-.66-.22l-1.34-1.57.92.88a.75.75 0 01-.66.22l-1.34+1.57.92-.88a.75.75 0 01-.66-.22l-1.34-1.57-.92.88a.75.75 0 01-.02-.67l-1.06-1.3a1.5 1.5 0 01-.55-.18H16.5a1.5 1.5 0 01.55.18l1.06 1.3a.75.75 0 01.02.67l-1.34-1.57.92.88a.75.75 0 01.02.67l1.34 1.57.92-.88a.75.75 0 01-.26-.16l-.55.68.93.88a.75.75 0 01.66.22l1.34-1.57.92.88a.75.75 0 01.26.16.75.75 0 00.28-.65l-1.56-1.81-1.33-1.52-.89-.88a.75.75 0 01-.26-.16l-.55.68-.93-.88a.75.75 0 01-.66-.22l-1.34+1.57-.92.88a.75.75 0 01-.66.22l-1.34-1.57-.92-.88a.75.75 0 01-.66.22l-1.34+1.57-.92-.88a.75.75 0 01-.66-.22l-1.34-1.57-.92.88a.75.75 0 01-.66-.22l-1.34+1.57-.92-.88a.75.75 0 01-.66.22l-1.34-1.57.92.88a.75.75 0 01-.66-.22l-1.34+1.57-.92.88a.75.75 0 01-.66.22l-1.34-1.57-.92-.88a.75.75 0 01-.66.22" />
                          </svg>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </CardHeader>
      </Card>

      {/* Student Details Sidebar when selected */}
      {selectedStudent && (
        <div className="mt-6 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted/60">Admission Number</p>
                  <p className="font-medium">{selectedStudent.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted/60">Grade</p>
                  <p className="font-medium">{selectedStudent.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted/60">Stream</p>
                  <p className="font-medium">{selectedStudent.stream}</p>
                </div>
                <div>
                  <p className="text-sm text-muted/60">Status</p>
                  <p className="font-medium">
                    <span className={selectedStudent.status === "ACTIVE" ? "text-success" : "text-destructive"}>
                      {selectedStudent.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-dark/30">
                <h3 className="font-semibold text-anglican-blue mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted/60">Parent/Guardian</p>
                  <p className="font-medium">{selectedStudent.parentContact}</p>
                  <p className="text-sm text-muted/60">Boarding</p>
                  <p className="font-medium">{selectedStudent.isBoarding ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}