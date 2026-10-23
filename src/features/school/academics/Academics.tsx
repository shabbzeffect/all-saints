/* School Academics - SaintsHub School Portal
Provides: Assessments, report cards, timetables, lesson plans
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Assessment {
  id: string
  title: string
  description: string
  assessmentType: "FORMATIVE" | "SUMMATIVE" | "SBA"
  grade: string
  subject: string
  term: string
  maxScore: number
  createdAt: string
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
}

interface AssessmentFilter {
  grade?: string
  type?: "FORMATIVE" | "SUMMATIVE" | "SBA"
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
  searchTerm?: string
}

export function Academics() {
  const [filters, setFilters] = useState<AssessmentFilter>({
    grade: "",
    type: "",
    status: "",
    searchTerm: "",
  })
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const grade = searchParams.get("grade") || ""
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    setFilters({ grade, type, status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchAssessments = useCallback(async () => {
    const response = await fetch(`/api/school/assessments${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setAssessments(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchAssessments()
  }, [fetchAssessments])

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesGrade = filters.grade ? assessment.grade === filters.grade : true
    const matchesType = filters.type ? assessment.assessmentType === filters.type : true
    const matchesStatus = filters.status ? assessment.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : assessment.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          assessment.subject.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesGrade && matchesType && matchesStatus && matchesSearch
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
          Academics
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Assessments, report cards & academic records
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
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="FORMATIVE">Formative</SelectItem>
                  <SelectItem value="SUMMATIVE">Summative</SelectItem>
                  <SelectItem value="SBA">SBA</SelectItem>
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by title or subject..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{assessments.length} Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No assessments found. Create an assessment first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Assessment</TableClassName>
                  <TableCell className="text-right">Max Score</TableCell>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Grade</TableCell>
                  <TableCell className="text-center">Term</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow
                    key={assessment.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{assessment.title}</div>
                      <div className="text-xs text-muted/60">{assessment.subject}</div>
                    </TableCell>
                    <TableCell className="text-right">{assessment.maxScore}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          assessment.assessmentType === "FORMATIVE"
                            ? "default"
                            : assessment.assessmentType === "SUMMATIVE"
                              ? "secondary"
                              : "destructive"
                        }
                        size="sm"
                      >
                        {assessment.assessmentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={assessment.grade === "Grade 1" || assessment.grade === "Grade 2" || assessment.grade === "Grade 3"
                          ? "default"
                          : assessment.grade === "Grade 4" || assessment.grade === "Grade 5"
                            ? "secondary"
                            : "destructive"
                        }
                        size="sm"
                      >
                        {assessment.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{assessment.term}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          assessment.status === "DRAFT"
                            ? "secondary"
                            : assessment.status === "ACTIVE"
                              ? "default"
                              : "destructive"
                        }
                        size="sm"
                      >
                        {assessment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View assessment"
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

      {/* Create Assessment Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Title</label>
              <Input name="title" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Description</label>
              <Input name="description" className="w-full" placeholder="Brief description" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select defaultValue="FORMATIVE" name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORMATIVE">Formative</SelectItem>
                  <SelectItem value="SUMMATIVE">Summative</SelectItem>
                  <SelectItem value="SBA">SBA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Grade</label>
              <Select defaultValue="Grade 7" name="grade">
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
              <label className="text-sm text-muted/60 mb-1">Subject</label>
              <Input name="subject" className="w-full" placeholder="e.g., Mathematics" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Max Score</label>
              <Input
                type="number"
                name="maxScore"
                min="1"
                value="100"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Term</label>
              <Input
                placeholder="e.g., Term 1"
                name="term"
                className="w-full"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Create Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}