/* School Boarding - SaintsHub School Portal
Provides: Boarding student management, dormitory overview, fee tracking
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

interface BoardingStudent {
  id: string
  studentName: string
  admissionNumber: string
  grade: string
  dormitory: string
  roomNumber: string
  leaseStart: string
  leaseEnd: string
  isCurrent: boolean
  rentAmount: number
  status: "ACTIVE" | "EXPIRED" | "TERMINATED"
  parentContact: string
  guardianName: string
}

interface BoardingFilter {
  status?: "ACTIVE" | "EXPIRED" | "TERMINATED"
  dormitory?: string
  searchTerm?: string
}

export function SchoolBoarding() {
  const [filters, setFilters] = useState<BoardingFilter>({
    status: "",
    dormitory: "",
    searchTerm: "",
  })
  const [students, setStudents] = useState<BoardingStudent[]>([])
  const [dormitories, setDormitories] = useState<any[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL
  useEffect(() => {
    const status = searchParams.get("status") || ""
    const dormitory = searchParams.get("dormitory") || ""
    setFilters({ status, dormitory, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchStudents = useCallback(async () => {
    const response = await fetch(`/api/boarding/assignments/student?studentId=${searchParams.get("studentId") || ""}${searchParams.toString() ? `&${searchParams.toString()` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setStudents(data.data || [])
  }, [searchParams])

  const fetchDormitories = useCallback(async () => {
    const response = await fetch("/api/boarding/dormitories?wing=SCHOOL", {
      cache: "no-store",
    })
    const data = await response.json()
    setDormitories(data.data || [])
  }, [])

  useEffect(() => {
    fetchStudents()
    fetchDormitories()
  }, [fetchStudents, fetchDormitories])

  const filteredStudents = students.filter((student) => {
    const matchesStatus = filters.status ? student.status === filters.status : true
    const matchesDormitory = filters.dormitory ? student.dormitory === filters.dormitory : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : student.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesStatus && matchesDormitory && matchesSearch
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

  const handleNavigate = (path: string) => {
    router.push(`/parent/boarding${path}`)
  }

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Boarding Students
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Boarding student directory & management
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
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Dormitory</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="dormitory"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dormitory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {/* Would populate from dormitories list */}
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
          <CardTitle>{students.length} Boarding Students</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No boarding students found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Student</TableClassName>
                  <TableCell className="text-center">Grade</TableCell>
                  <TableCell className="text-center">Dormitory</TableCell>
                  <TableCell className="text-center">Room</TableCell>
                  <TableCell className="text-center">Lease Period</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-xs text-muted/60">{student.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={student.grade === "Grade 7" || student.grade === "Grade 8" ? "default" : student.grade === "Grade 9" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {student.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{student.dormitory}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{student.roomNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">Lease: {student.leaseStart} - {student.leaseEnd}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={student.status === "ACTIVE" ? "default" : student.status === "EXPIRED" ? "destructive" : "secondary"}
                        size="sm"
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        onClick={() => handleNavigate(`/student/${student.id}`)}
                        aria="View student details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
      </Card>

      {/* Key Metrics */}
      <Card className="mt-4 p-4 sm:p-6 border border-border-dark/30 rounded-lg">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-anglican-blue font-medium">Active Students</p>
            <p className="font-bold text-2xl text-success">
              {students.filter((s) => s.status === "ACTIVE").length}
            </p>
          </div>
          <div>
            <p className="text-anglican-blue font-medium">Expired Leases</p>
            <p className="font-bold text-2xl text-destructive">
              {students.filter((s) => s.status === "EXPIRED").length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}