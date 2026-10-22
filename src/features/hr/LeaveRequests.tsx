/* eslint-disable react/prop-types */
/* HR Leave Requests - SaintsHub */
import { useState, useEffect, useNavigate } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { Calendar, Loader2, X } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface LeaveRequestForm {
  leaveTypeId: string
  startDate: Date
  endDate: Date
  daysRequested: number
  reason: string
}

interface LeaveRequest {
  id: string
  leaveType: { name: string; daysPerYear: number }
  startDate: Date
  endDate: Date
  daysRequested: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
  staffName: string
}

interface LeaveBalance {
  annual: number
  sick: number
  personal: number
  pending: number
}

interface LeaveRequestsProps {
  staffId: string
  staffName: string
  initialBalance?: LeaveBalance
}

export function LeaveRequests({ staffId, staffName, initialBalance }: LeaveRequestsProps) {
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [form, setForm] = useState<LeaveRequestForm>({
    leaveTypeId: "",
    startDate: new Date(),
    endDate: new Date(),
    daysRequested: 1,
    reason: "",
  })
  const [leaveTypes, setLeaveTypes] = useState<{ key: string; name: string }[]>([])
  const [balance, setBalance] = useState<LeaveBalance>({
    annual: initialBalance?.annual ?? 21,
    sick: initialBalance?.sick ?? 7,
    personal: initialBalance?.personal ?? 5,
    pending: initialBalance?.pending ?? 0,
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchLeaveTypes()
    fetchRequests()
  }, [])

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch("/api/hr?action=leave-types", {
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      setLeaveTypes(data.map((lt: { key: string; name: string }) => ({ key: lt.key, name: lt.name })))
    } catch (e) {
      console.error("Failed to fetch leave types", e)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/hr?action=leave-requests&staffId=" + staffId, {
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      setRequests(data)
    } catch (e) {
      console.error("Failed to fetch leave requests", e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/hr?action=submit-leave-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          leaveTypeId: form.leaveTypeId,
          startDate: form.startDate.toISOString(),
          endDate: form.endDate.toISOString(),
          daysRequested: form.daysRequested,
          reason: form.reason,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Leave Request Submitted",
          description: `Your ${form.leaveTypeId} leave request has been submitted. Status: ${data.status}.`,
          variant: "default",
        })
        fetchRequests()
        setForm({
          leaveTypeId: "",
          startDate: new Date(),
          endDate: new Date(),
          daysRequested: 1,
          reason: "",
        })
        navigate("/hr/leave/" + staffId)
      } else {
        toast({
          title: "Request Failed",
          description: data.error || "Unknown error submitting leave request",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error submitting leave request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Leave Management - {staffName}
        </h1>
        <p className="text-muted dark:text-muted-foreground/60 mt-1">
          Request time off and view your leave balance
        </h1>
      </div>

      {/* Balance Summary */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </Header>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted/60">Annual</span>
              <div className="mt-1 font-medium">{balance.annual} days</div>
              <div className="text-anglican-blue text-sm">
                {balance.pending} pending
              </div>
            </div>
            <div>
              <span className="text-muted/60">Sick</span>
              <div className="mt-1 font-medium">{balance.sick} days</div>
            </div>
            <div>
              <span className="text-muted/60">Personal</span>
              <div className="mt-1 font-medium">{balance.personal} days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Leave Request Form */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>New Leave Request</CardTitle>
        </Header>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-sm text-muted/60">Leave Type</span>
              <Select onValueChange={(val) => setForm((prev) => ({ ...prev, leaveTypeId: val as string }))} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.key} value={lt.key}>
                      {lt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-sm text-muted/60">Start Date</span>
              <Input
                type="date"
                value={form.startDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: new Date(e.target.value) }))
                }
                className="w-full"
              />
            </div>

            <div>
              <span className="text-sm text-muted/60">End Date</span>
              <Input
                type="date"
                value={form.endDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: new Date(e.target.value) }))
                }
                className="w-full"
              />
            </div>

            <div>
              <span className="text-sm text-muted/60">Days Requested</span>
              <Input
                type="number"
                value={form.daysRequested}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, daysRequested: Number(e.target.value) }))
                }
                min="1"
                className="w-full"
              />
              <p className="text-xs text-muted/60 mt-1">
                Available: {balance.annual - balance.pending} days
              </p>
            </div>

            <div>
              <span className="text-sm text-muted/60">Reason</span>
              <Input
                placeholder="e.g., Family wedding, medical appointment, personal matters"
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 me-2" />
              ) : "Submit Leave Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Request History</CardTitle>
        </Header>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted dark:text-muted-foreground/60">
              No leave requests found. Submit your first request above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableRequestType>Leave Type</TableRequestType>
                  <TableRequestType>Period</TableRequestType>
                  <TableRequestType>Days</TableRequestType>
                  <TableRequestType>Status</TableRequestType>
                  <TableRequestType>Submitted</TableRequestType>
                  <TableRequestType>Action</TableRequestType>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-angle/5 dark:hover:bg-angle/80">
                    <TableRequestType>{r.leaveType.name}</TableRequestType>
                    <TableRequestType>
                      {new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}
                    </TableRequestType>
                    <TableRequestType className="text-right font-medium">{r.daysRequested} days</TableRequestType>
                    <TableRequestType>
                      <Badge
                        variant={r.status === "APPROVED" ? "default" : r.status === "REJECTED" ? "destructive" : "secondary"}
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </TableRequestType>
                    <TableRequestType>
                      <div className="text-sm">
                        {new Date(r.createdAt).toLocaleDateString("en-KE")}
                        {r.status === "PENDING" ? " • Pending" : ""}
                      </div>
                    </TableRequestType>
                    <TableRequestType>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria-label="View details"
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
                    </TableRequestType>
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

// Helper component type (kept simple)
function TableRequestType(label: string) {
  return <TableCell>{label}</TableCell>
}