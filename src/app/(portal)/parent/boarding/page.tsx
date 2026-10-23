/* Parent Boarding - SaintsHub Parent Portal
Provides: View child's boarding status, fees, exeat pass requests
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

interface ParentBoardingStudent {
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
  exeatPasses: any[]
}

interface ParentBoardingFilter {
  status?: "ACTIVE" | "EXPIRED" | "TERMINATED"
  searchTerm?: string
}

export function ParentBoarding() {
  const [filters, setFilters] = useState<ParentBoardingFilter>({
    status: "",
    searchTerm: "",
  })
  const [student, setStudent] = useState<ParentBoardingStudent | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize from URL
  useEffect(() => {
    const status = searchParams.get("status") || ""
    setFilters({ status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchStudent = useCallback(async (studentId: string) => {
    // In a real app, would fetch from API
    // const response = await fetch(`/api/boarding/assignments/student?studentId=${studentId}`)
    // const data = await response.json()
    // setStudent(data.data)
    // For now, mock data
    setStudent({
      id: "student-001",
      studentName: "John Omondi",
      admissionNumber: "ADM-2024-001",
      grade: "Grade 7",
      dormitory: "Boys' House",
      roomNumber: "R-101",
      leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      leaseEnd: new Date(Date.now() + 604800000).toISOString().split("T")[0],
      isCurrent: true,
      rentAmount: 50000,
      status: "ACTIVE",
      parentContact: "+254712345678",
      guardianName: "Joseph Omondi",
      exeatPasses: [
        {
          id: "exeat-001",
          reason: "Family function in Nairobi",
          startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          status: "APPROVED",
        },
      ],
    })
  }, [])

  useEffect(() => {
    fetchStudent("student-001")
  }, [])

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

  if (!student) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center text-muted dark:text-muted-foreground py-8">
          Loading boarding student information...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Boarding Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          {student?.studentName}'s boarding overview
        </p>
      </header>

      {/* Student Overview */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{student?.studentName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Grade</p>
              <p className="font-bold">{student?.grade}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Dormitory</p>
              <p className="font-bold">{student?.dormitory}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Room</p>
              <p className="font-bold">{student?.roomNumber}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Rent</p>
              <p className="font-bold">KSh {student?.rentAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      <Card>
        <CardHeader>
          <CardTitle>Boarding Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant={student?.status === "ACTIVE" ? "default" : student?.status === "EXPIRED" ? "destructive" : "secondary"}
            size="lg"
          >
            {student?.status}
          </Badge>
        </CardContent>
      </Card>

      {/* Exeat Passes */}
      <Card>
        <CardHeader>
          <CardTitle>Exeat Passes</CardTitle>
        </CardHeader>
        <CardContent>
          {student?.exeatPasses.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No exeat passes found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Pass</TableClassName>
                  <TableCell className="text-center">Dates</TableCell>
                  <TableCell className="text-center">Reason</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student?.exeatPasses.map((pass) => (
                  <TableRow
                    key={pass.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div>{pass.reason}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{pass.startDate} - {pass.endDate}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={pass.status === "APPROVED" ? "default" : "secondary"}
                        size="sm"
                      >
                        {pass.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="primary"
              onClick={() => router.push(`/parent/boarding/request-exeat`}
            )
            >
              Request New Exeat Pass
            </Button>
            <Button
              variant="default"
              onClick={() => router.push(`/parent/boarding/fees`}
            )
            >
              View Billing
            </Button>
            <Button
              variant="link"
              onClick={() => router.push(`/parent/boarding/passes`}
            )
            >
              View Pass History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}