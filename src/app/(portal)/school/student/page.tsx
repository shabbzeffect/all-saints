/* Student Detail - SaintsHub School Portal
Provides: Comprehensive student boarding details, assignment info, billing history
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

interface StudentDetails {
  id: string
  studentName: string
  studentAdmission: string
  grade: string
  gender: "MALE" | "FEMALE"
  dateOfBirth: string
  address: string
  contactNumber: string
  emergencyContact: string
  parentGuardianName: string
  parentGuardianContact: string
  religion: string
  nationality: string
  profileImage?: string
}

interface StudentAssignment {
  id: string
  roomId: string
  roomNumber: string
  dormitoryName: string
  studentId: string
  studentName: string
  studentAdmission: string
  grade: string
  leaseStart: string
  leaseEnd: string
  isCurrent: boolean
  rentAmount: number
  daysRemaining: number
  status: "ACTIVE" | "EXPIRED" | "TERMINATED"
  assignedAt: string
  assignedBy: string
}

interface StudentBilling {
  id: string
  feeId: string
  feeName: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

interface StudentProfile {
  student: StudentDetails
  currentAssignment: StudentAssignment | null
  billingHistory: StudentBilling[]
}

export function StudentDetailPage() {
  const [searchParams] = useSearchParams()
  const [studentId, setStudentId] = useState(searchParams.get("studentId") || "std-001")
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const router = useRouter()

  // Fetch student profile
  const fetchStudent = useCallback(async () => {
    const response = await fetch(`/api/boarding/assignments/student?studentId=${studentId}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setProfile(data.data)
  }, [studentId])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  if (!profile) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center text-muted dark:text-muted-foreground py-8">
          Loading student details...
        </div>
      </div>
    )
  }

  const student = profile.student
  const assignment = profile.currentAssignment
  const billing = profile.billingHistory

  // Format date of birth
  const dob = new Date(student.dateOfBirth).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Calculate age
  const today = new Date()
  const birthDate = new Date(student.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          {student.studentName} - Boarding Profile
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Admission: {student.studentAdmission}
        </p>
      </header>

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-anglican-blue font-medium">Full Name</p>
              <p className="font-bold text-lg">{student.studentName}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Admission Number</p>
              <p className="font-bold text-lg">{student.studentAdmission}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Grade Level</p>
              <p className="font-bold text-lg">{student.grade}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Age</p>
              <p className="font-bold text-lg">{age}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Gender</p>
              <p className="font-bold text-lg">
                {student.gender === "MALE" ? "Male" : "Female"}
              </p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Nationality</p>
              <p className="font-bold text-lg">{student.nationality}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Date of Birth</p>
              <p className="font-bold text-lg">{dob}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Religion</p>
              <p className="font-bold text-lg">{student.religion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignment */}
      {assignment ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Boarding Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-anglican-blue font-medium">Dormitory</p>
                <p className="font-bold">{assignment.dormitoryName}</p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Room Number</p>
                <p className="font-bold">{assignment.roomNumber}</p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Lease Period</p>
                <p className="font-bold">
                  {new Date(assignment.leaseStart).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })} - {new Date(assignment.leaseEnd).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Rent Amount</p>
                <p className="font-bold text-destructive">KSh {assignment.rentAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Days Remaining</p>
                <p className="font-bold text-success">
                  {assignment.daysRemaining} days
                </p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Status</p>
                <p className="font-bold">
                  <Badge
                    variant={assignment.status === "ACTIVE" ? "default" : assignment.status === "EXPIRED" ? "destructive" : "secondary"}
                    size="sm"
                  >
                    {assignment.status}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Assigned At</p>
                <p className="font-bold text-muted/60">
                  {new Date(assignment.assignedAt).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div>
                <p className="text-anglican-blue font-medium">Assigned By</p>
                <p className="font-bold text-muted/60">{assignment.assignedBy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Boarding Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No current boarding assignment found.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {billing.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No billing records found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Fee</TableCell>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Period</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.map((billing) => (
                  <TableRow
                    key={billing.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{billing.feeName}</div>
                      <div className="text-xs text-muted/60">{billing.feeId}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">KSh {billing.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{billing.period}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={billing.status === "PENDING" ? "secondary" : billing.status === "PAID" ? "default" : "destructive"}
                        size="sm"
                      >
                        {billing.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Section */}
      <Card className="mt-6 p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="primary"
              onClick={() => router.push(`/parent/boarding/student/${studentId}`}
            )
            >
              View Parent Portal
            </Button>
            <Button
              variant="default"
              onClick={() => router.push(`/school/boarding/student/${studentId}`}
            )
            >
              Edit Assignment
            </Button>
            <Button
              variant="link"
              onClick={() => router.push(`/parent/boarding/fees?studentId=${studentId}`}
            )
            >
              Pay Billing
            </Button>
            <Button
              variant="link"
              onClick={() => router.push(`/parent/boarding/exeat/${studentId}`}
            )
            >
              Request Exeat Pass
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}