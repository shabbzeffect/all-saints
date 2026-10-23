/* StudentsPage.tsx
 * School - Students management page
 * Provides: Student list, search, details, enrollment actions
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Student {
  id: string
  admissionNumber: string
  fullName: string
  grade: string
  class: string
  wing: "SCHOOL"
  status: "active" | "inactive"
  isBoarding: boolean
  dateOfAdmission: string
}

interface StudentsFilter {
  searchTerm?: string
  grade?: string
  status?: "active" | "inactive"
  wing?: "SCHOOL"
}

export function StudentsPage() {
  const [filter, setFilter] = useState<StudentsFilter>({})
  const [searchTerm, setSearchTerm] = useState("")

  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    fetch(`/api/school/students${searchTerm ? `?search=${searchTerm}` : ""}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch((err) => console.error("Failed to fetch students:", err))
  }, [searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setFilter({ ...filter, searchTerm: e.target.value })
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, grade: e.target.value as string })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, status: e.target.value as "active" | "inactive" })
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="w-full"
            />

            <Select
              onValueChange={handleGradeChange}
              defaultValue=""
              name="grade"
            >
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
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

            <Select
              onValueChange={handleStatusChange}
              defaultValue=""
              name="status"
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableClassName>Student</TableClassName>
                <TableCell className="w-32">Adm No.</TableCell>
                <TableCell>Student</TableCell>
                <TableCell className="text-right">Grade</TableCell>
                <TableCell className="text-center">Wing</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell className="text-right">Admitted</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{student.admissionNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.fullName}</div>
                    <div className="text-xs text-muted/60">{student.class}</div>
                  </TableCell>
                  <TableCell className="text-center">{student.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={student.isBoarding ? "default" : "secondary"}
                      size="sm"
                    >
                      {student.isBoarding ? "Boarding" : "Day"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={student.status === "active" ? "default" : "secondary"}
                      size="sm"
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{student.dateOfAdmission}</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="link"
                      className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
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

          {students.length === 0 && (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No students found. Add students first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

StudentsPage.displayName = "StudentsPage"