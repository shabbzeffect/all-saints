import { NextResponse } from "next/server"

interface LeaveType {
  key: string
  name: string
  daysPerYear: number
  description: string
}

interface LeaveRequest {
  id: string
  leaveType: { key: string; name: string; daysPerYear: number }
  startDate: string
  endDate: string
  daysRequested: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  staffName: string
}

const mockLeaveTypes: LeaveType[] = [
  { key: "ANNUAL", name: "Annual Leave", daysPerYear: 21, description: "Paid annual leave" },
  { key: "SICK", name: "Sick Leave", daysPerYear: 7, description: "Paid sick leave" },
  { key: "MATERNITY", name: "Maternity Leave", daysPerYear: 90, description: "Maternity/paternity leave" },
  { key: "COMPASSIONATE", name: "Compassionate Leave", daysPerYear: 5, description: "Bereavement/emergency leave" },
  { key: "MARRIAGE", name: "Marriage Leave", daysPerYear: 3, description: "Marriage leave" },
  { key: "STUDY", name: "Study Leave", daysPerYear: 10, description: "Study/examination leave" },
]

const mockRequests: LeaveRequest[] = [
  {
    id: "lr-001",
    leaveType: { key: "ANNUAL", name: "Annual Leave", daysPerYear: 21, description: "Paid annual leave" },
    startDate: new Date(Date.now() - 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    daysRequested: 5,
    status: "PENDING",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    staffName: "Mary Achieng",
  },
  {
    id: "lr-002",
    leaveType: { key: "SICK", name: "Sick Leave", daysPerYear: 7, description: "Paid sick leave" },
    startDate: new Date(Date.now() - 172800000).toISOString(),
    endDate: new Date(Date.now() - 86400000).toISOString(),
    daysRequested: 2,
    status: "APPROVED",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    staffName: "John Okoth",
  },
  {
    id: "lr-003",
    leaveType: { key: "MATERNITY", name: "Maternity Leave", daysPerYear: 90, description: "Maternity/paternity leave" },
    startDate: new Date(Date.now() - 345600000).toISOString(),
    endDate: new Date(Date.now() + 604800000).toISOString(),
    daysRequested: 60,
    status: "PENDING",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    staffName: "Jane Akinyi",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "leave-types") {
      return NextResponse.json({
        success: true,
        data: mockLeaveTypes,
      })
    }

    const staffId = searchParams.get("staffId") || "staff-001"

    let filteredRequests = mockRequests.filter((r) => r.staffName)

    if (action === "leave-requests" && staffId) {
      filteredRequests = mockRequests.filter(
        (r) => r.staffName.toLowerCase().includes(staffId.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredRequests,
    })
  } catch (error) {
    console.error("HR error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch HR data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newRequest: LeaveRequest = {
      id: `lr-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: "Leave request submitted successfully",
    })
  } catch (error) {
    console.error("Create leave request error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit leave request" },
      { status: 500 }
    )
  }
}