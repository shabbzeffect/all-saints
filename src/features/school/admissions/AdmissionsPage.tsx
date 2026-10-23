/* AdmissionsPage.tsx
 * School - Admissions management page
 * Provides: Student admissions, applicant list, enrollment actions
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Applicant {
  id: string
  fullName: string
  email: string
  phone: string
  currentSchool: string
  grade: string
  wing: "SCHOOL"
  status: "pending" | "accepted" | "rejected" | "enrolled"
  dateCreated: string
}

interface AdmissionsFilter {
  status?: "pending" | "accepted" | "rejected" | "enrolled"
  grade?: string
  searchTerm?: string
}

export function AdmissionsPage() {
  const [filter, setFilter] = useState<AdmissionsFilter>({})
  const [searchTerm, setSearchTerm] = useState("")

  const [applicants, setApplicants] = useState<Applicant[]>([])

  useEffect(() => {
    fetch(`/api/school/admissions${searchTerm ? `?search=${searchTerm}` : ""}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setApplicants(data.applicants || []))
      .catch((err) => console.error("Failed to fetch admissions:", err))
  }, [searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setFilter({ ...filter, searchTerm: e.target.value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, status: e.target.value as "pending" | "accepted" | "rejected" | "enrolled" })
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, grade: e.target.value as string })
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
            <Input
              placeholder="Search applicants..."
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="w-full"
            />

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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
              </SelectContent>
            </Select>

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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableClassName>Applicant</TableClassName>
                <TableCell className="w-32">Name</TableCell>
                <TableCell className="text-right">Email</TableCell>
                <TableCell className="text-right">Phone</TableCell>
                <TableCell className="text-right">Current School</TableCell>
                <TableCell className="text-center">Grade</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => (
                <TableRow
                  key={applicant.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{applicant.fullName}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell className="text-right">{applicant.phone}</TableCell>
                  <TableCell>{applicant.currentSchool}</TableCell>
                  <TableCell className="text-center">{applicant.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        applicant.status === "pending"
                          ? "secondary"
                          : applicant.status === "accepted"
                            ? "default"
                            : applicant.status === "rejected"
                              ? "destructive"
                              : "success"
                      }
                      size="sm"
                    >
                      {applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="link"
                      className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                    >
                      <svg
                        xmlns="http.w3.org/2000/svg"
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

          {applicants.length === 0 && (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No applicants found. Start admissions first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

AdmissionsPage.displayName = "AdmissionsPage"