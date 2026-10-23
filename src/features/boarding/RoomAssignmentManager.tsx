/* Room Assignment Manager - SaintsHub Boarding Module
Provides: Assign students to rooms, manage room assignments
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface AssignmentFormState {
  studentId: string
  studentName: string
  roomId: string
  roomNumber: string
  dormitoryName: string
  leaseStart: string
  leaseEnd: string
  rentAmount: number
  assignedBy: string
}

interface AssignmentFilter {
  status?: "ACTIVE" | "EXPIRED" | "TERMINATED"
  dormitoryId?: string
  searchTerm?: string
}

export function RoomAssignmentManager() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [form, setForm] = useState<AssignmentFormState>({
    studentId: "",
    studentName: "",
    roomId: "",
    roomNumber: "",
    dormitoryName: "",
    leaseStart: new Date().toISOString().split("T")[0],
    leaseEnd: "",
    rentAmount: 0,
    assignedBy: "",
  })
  const searchParams = useSearchParams()

  // Initialize assignments from URL if needed
  useEffect(() => {
    // In a real app, would fetch from API with filters
    // const studentId = searchParams.get("studentId") || ""
    // ...fetch assignments for student
  }, [searchParams])

  // Mock data for now
  useEffect(() => {
    const mockAssignments = [
      {
        id: "assign-001",
        studentId: "std-001",
        studentName: "John Omondi",
        roomId: "room-001",
        roomNumber: "R-101",
        dormitoryName: "Boys' House",
        leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 604800000).toISOString().split("T")[0],
        isCurrent: true,
        rentAmount: 50000,
      },
      {
        id: "assign-002",
        studentId: "std-003",
        studentName: "Peter Omondi",
        roomId: "room-002",
        roomNumber: "R-103",
        dormitoryName: "Boys' House",
        leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        isCurrent: true,
        rentAmount: 80000,
      },
    ]
    setAssignments(mockAssignments)
  }, [])

  const handleSubmit = () => {
    // In a real app, would call API to create assignment
    // await fetch("/api/boarding/assignments", {
    //   method: "POST",
    //   body: JSON.stringify(form)
    // })
    setForm({
      studentId: "",
      studentName: "",
      roomId: "",
      roomNumber: "",
      dormitoryName: "",
      leaseStart: new Date().toISOString().split("T")[0],
      leaseEnd: "",
      rentAmount: 0,
      assignedBy: "",
    })
  }

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Room Assignments
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Assign students to dormitory rooms
        </p>
      </header>

      {/* Assignment Form */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Assign Student to Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Student</label>
              <Select defaultValue="" name="student">
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select student</SelectItem>
                  {/* Would populate from students list */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Room</label>
              <Select defaultValue="" name="room">
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select room</SelectItem>
                  {/* Would populate from rooms list */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Lease Start</label>
              <Input
                type="date"
                name="leaseStart"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Lease End</label>
              <Input
                type="date"
                name="leaseEnd"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Rent Amount</label>
              <Input
                type="number"
                name="rentAmount"
                min="1"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Assigned By</label>
              <Input name="assignedBy" className="w-full" />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Assign Student
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No current assignments.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Student</TableClassName>
                  <TableCell className="text-center">Room</TableCell>
                  <TableCell className="text-center">Dormitory</TableCell>
                  <TableCell className="text-center">Lease Period</TableCell>
                  <TableCell className="text-right">Rent</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow
                    key={assignment.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{assignment.studentName}</div>
                      <div className="text-xs text-muted/60">{assignment.studentAdmission}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.roomNumber}</div>
                      <div className="text-xs text-muted/60">{assignment.dormitoryName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{assignment.leaseStart} - {assignment.leaseEnd}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">KSh {assignment.rentAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View assignment details"
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
    </div>
  )
}