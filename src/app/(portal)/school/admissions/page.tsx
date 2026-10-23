/* School Admissions - SaintsHub School Portal
Provides: Admission applications, student registration
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface AdmissionApplication {
  id: string
  studentName: string
  admissionNumber: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  gradeApply: string
  previousSchool: string
  contactName: string
  contactPhone: string
  contactEmail: string
  currentGrade: string
  religion: string
  status: "PENDING" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED"
  appliedAt: string
  notes?: string
}

interface AdmissionFilter {
  grade?: string
  status?: "PENDING" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED"
  searchTerm?: string
}

export function SchoolAdmissions() {
  const [filters, setFilters] = useState<AdmissionFilter>({
    grade: "",
    status: "",
    searchTerm: "",
  })
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const grade = searchParams.get("grade") || ""
    const status = searchParams.get("status") || ""
    setFilters({ grade, status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchApplications = useCallback(async () => {
    const response = await fetch(`/api/school/admissions${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setApplications(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filteredApplications = applications.filter((application) => {
    const matchesGrade = filters.grade ? application.gradeApply === filters.grade : true
    const matchesStatus = filters.status ? application.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : application.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          application.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          application.contactEmail.toLowerCase().includes(filters.searchTerm.toLowerCase())

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
          School Admissions
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Admission applications & student registration
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by name, admission number or email..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>{applications.length} Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No applications found. Submit an admission application first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Applicant</TableClassName>
                  <TableCell className="text-right">Grade</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Applied</TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow
                    key={application.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{application.studentName}</div>
                      <div className="text-xs text-muted/60">{application.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          application.status === "PENDING"
                            ? "secondary"
                            : application.status === "UNDER_REVIEW"
                              ? "default"
                              : application.status === "ACCEPTED"
                                ? "success"
                                : "destructive"
                        }
                        size="sm"
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{new Date(application.appliedAt).toLocaleDateString("en-KE")}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View application details"
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
      </Card>

      {/* Submit Admission Application Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Submit Admission Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Student Name</label>
              <Input name="studentName" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Date of Birth</label>
              <Input
                type="date"
                name="dateOfBirth"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Gender</label>
              <Select defaultValue="MALE" name="gender">
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Grade Applying For</label>
              <Select defaultValue="Grade 1" name="gradeApply">
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm text-muted/60 mb-1">Previous School</label>
              <Input name="previousSchool" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Contact Name</label>
              <Input name="contactName" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Contact Phone</label>
              <Input
                type="tel"
                name="contactPhone"
                placeholder="+254712345678"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Contact Email</label>
              <Input
                type="email"
                name="contactEmail"
                placeholder="contact@email.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Current Grade</label>
              <Input name="currentGrade" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Religion</label>
              <Input name="religion" className="w-full" />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Submit Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}