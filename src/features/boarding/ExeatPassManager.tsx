/* Exeat Pass Manager - SaintsHub Boarding Module
Provides: Submit, view, approve/reject exeat pass requests
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

interface ExeatPassFormState {
  studentId: string
  studentName: string
  grade: string
  reason: string
  startDate: string
  endDate: string
  requestedBy: string
}

interface ExeatPass {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  reason: string
  startDate: string
  endDate: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  requestedBy: string
  approvedBy?: string
  approvedAt?: string
  daysRequested: number
}

interface ExeatApprovalRequest {
  status: "APPROVED" | "REJECTED"
  approvedBy: string
  notes?: string
}

interface ExeatFilter {
  status?: "PENDING" | "APPROVED" | "REJECTED"
  grade?: string
  searchTerm?: string
}

export function ExeatPassManager() {
  const [passes, setPasses] = useState<ExeatPass[]>([])
  const [form, setForm] = useState<ExeatPassFormState>({
    studentId: "",
    studentName: "",
    grade: "Grade 7",
    reason: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    requestedBy: "",
  })
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL
  useEffect(() => {
    const status = searchParams.get("status") || ""
    setFilters({ status, grade: searchParams.get("grade") || "", searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const [filters, setFilters] = useState({
    status: "",
    grade: "",
    searchTerm: "",
  })

  // Fetch passes from API
  const fetchPasses = useCallback(async () => {
    const response = await fetch(`/api/boarding/ exeat-passes/pending${searchParams.toString() ? `?${searchParams.toString()` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setPasses(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchPasses()
  }, [fetchPasses])

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

  const approvePass = useCallback(async (passId: string, approvedBy: string) => {
    const response = await fetch(`/api/boarding/ exeat-passes/approve?id=${passId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "APPROVED",
        approvedBy,
      }),
    })
    const data = await response.json()
    if (data.success) {
      fetchPasses()
    }
    return data
  }, [fetchPasses])

  const rejectPass = useCallback(async (passId: string, approvedBy: string, notes?: string) => {
    const response = await fetch(`/api/boarding/ exeat-passes/approve?id=${passId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "REJECTED",
        approvedBy,
        notes,
      }),
    })
    const data = await response.json()
    if (data.success) {
      fetchPasses()
    }
    return data
  }, [fetchPasses])

  // Mock data fallback
  useEffect(() => {
    if (passes.length === 0) {
      const mockPasses: ExeatPass[] = [
        {
          id: "exeat-001",
          studentId: "std-001",
          studentName: "John Omondi",
          admissionNumber: "ADM-2024-001",
          grade: "Grade 7",
          reason: "Family function in Nairobi",
          startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          status: "PENDING",
          requestedBy: "admin-001",
          daysRequested: 2,
        },
        {
          id: "exeat-002",
          studentId: "std-002",
          studentName: "Jane Doe",
          admissionNumber: "ADM-2024-002",
          grade: "Grade 8",
          reason: "Medical appointment",
          startDate: new Date(Date.now()).toISOString().split("T")[0],
          endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          status: "PENDING",
          requestedBy: "staff-001",
          daysRequested: 1,
        },
      ]
      setPasses(mockPasses)
    }
  }, [passes.length])

  const handleSubmit = () => {
    // In a real app, would call API to create exeat pass
    // await fetch("/api/boarding/exeat-passes", {
    //   method: "POST",
    //   body: JSON.stringify(form)
    // })
    setForm({
      studentId: "",
      studentName: "",
      grade: "Grade 7",
      reason: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      requestedBy: "",
    })
    router.push("/parent/boarding")
  }

  const handleStatusChange = useCallback(
    async (status: "APPROVED" | "REJECTED", passId: string) => {
      const userName = "principal-001"
      if (status === "APPROVED") {
        await approvePass(passId, userName)
      } else {
        await rejectPass(passId, userName)
      }
    },
    [approvePass, rejectPass]
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Exeat Pass Manager
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Submit and manage student exeat pass requests
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Grade</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="grade"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by student name or reason..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Request Exeat Pass</CardTitle>
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
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Reason</label>
              <Input
                name="reason"
                className="w-full"
                placeholder="e.g., Family function, medical appointment, wedding"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Start Date</label>
              <Input
                type="date"
                name="startDate"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">End Date</label>
              <Input
                type="date"
                name="endDate"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Requested By</label>
              <Input name="requestedBy" className="w-full" />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full"
                onClick={handleSubmit}
              >
                Request Exeat Pass
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Passes */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Exeat Passes {passes.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {passes.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No pending exeat passes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell className="text-center">Dates</TableCell>
                  <TableCell className="text-center">Reason</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passes.map((pass) => (
                  <TableRow
                    key={pass.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{pass.studentName}</div>
                      <div className="text-xs text-muted/60">{pass.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{pass.startDate} - {pass.endDate}</div>
                    </TableCell>
                    <TableCell className="text-center">{pass.reason}</div>
                    <TableCell className="text-center">
                      <Badge
                        variant={pass.status === "PENDING" ? "secondary" : pass.status === "APPROVED" ? "default" : "destructive"}
                        size="sm"
                      >
                        {pass.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pass.status === "PENDING" && (
                          <>
                            <Button
                              size="icon"
                              variant="default"
                              className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                              onClick={() => handleStatusChange("APPROVED", pass.id)}
                              aria="Approve exeat pass"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M2.93 1.87A2.98 2.98 0 015.06 3.01c0 .874-.057 1.717-.172 2.533H8.9a2.983 2.983 0 011.838 1.11l.452 1.06 1.06.452a2.984 2.984 0 011.11 1.838l-.321.777L14.86 8.9a2.984 2.984 0 011.11-1.838l.777-.321l1.06-.452a2.983 2.983 0 00-1.11-1.838L11.89 5.06l-.452-1.06L8.93 1.87a2.98 2.98 0 00-1.838-1.11H5.06a2.98 2.98 0 00-1.11-1.838L3.01 2.93a2.98 2.98 0 00-.172.533l-.778.321-.321.777L5.06 8.93l-.777.321-.321-.777L2.93 5.06l.321-.777L1.87 2.93a2.98 2.98 0 00-.533-.172zM8.93 15.1a5.98 5.98 0 01-.172-.533l-.321-.777L5.06 8.93l-.777.321-.321.777L5.06 15.1a5.98 5.98 0 01-.172.533l.321.777L8.93 17.03l.777-.321.321-.777L8.93 15.1zM8.93 5.93a5.98 5.98 0 01.172-.533l.321-.777L5.06 5.06l.777.321.321.777L5.06 6.93a5.98 5.98 0 01.172.533l-.321.777L8.93 7.9l.777-.321.321-.777L8.93 5.93z" />
                              </svg>
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="text-destructive/60 hover:text-destructive text-sm"
                              onClick={() => handleStatusChange("REJECTED", pass.id)}
                              aria="Reject exeat pass"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.06 11.73a1 1 0 01-.72-.44l-2.21-.7a1 1 0 01-.32-1.04l.83-2.32a1 1 0 011.06-1.06l2.21.7a1 1 0 01.66.44l2.66 1.32a1 1 0 01.13.84l-1.84 2.96a1 1 0 01-.31.98l2.31 1.19a1 1 0 01-.83 1.05l-2.66-.15zM8.35 7.43l-2.21-.7a1 1 0 01-.84-.52l-.52-2.21a1 1 0 011.06-1.06l2.21.7a1 1 0 01.52.84l.52 2.21a1 1 0 01-.84.52l-2.21.7a1 1 0 01-.52-1.04l2.21-.7a1 1 0 011.06-.44l2.66 1.32a1 1 0 01.84.52l1.32 2.21a1 1 0 01.44.83l-.15 2.66a1 1 0 01-.84.52L8.35 7.43zm-1.66-1.52L8.35 2.02a1 1 0 01-.38-.18l-.52 2.21a1 1 0 01-1.06-.08l-2.21-.7a1 1 0 01-.84-.52l-.52-2.21a1 1 0 011.06-1.06l2.21.7a1 1 0 01.52.84l.52-2.21a1 1 0 01-.84.52l-2.21.7a1 1 0 01-.52-1.04L5.06 5.5l.52-2.21a1 1 0 011.06-.08l2.21.7a1 1 0 01.84.52l.52 2.21a1 1 0 01-.84.52l-2.21-.7a1 1 0 01-.52-1.04L3.74 4.06a1 1 0 01-.38-.18z" />
                              </svg>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Status Info */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Approval Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted/60">
            Approved passes will grant the student permission to leave the dormitory
            during the specified dates. Rejected passes will deny the request. All
            passes require principal approval and are recorded in the student's
            boarding file.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}