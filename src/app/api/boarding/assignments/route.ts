import { NextResponse } from "next/http"

interface RoomAssignment {
  id: string
  roomId: string
  studentId: string
  assignedAt: string
  assignedBy: string
  leaseStart: string
  leaseEnd?: string
  isCurrent: boolean
  rentAmount: number
  studentName: string
  studentAdmission: string
  status: "ACTIVE" | "EXPIRED" | "TERMINATED"
}

interface AssignmentFilter {
  roomId?: string
  studentId?: string
  status?: "ACTIVE" | "EXPIRED" | "TERMINATED"
  isCurrent?: boolean
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status") as "ACTIVE" | "EXPIRED" | "TERMINATED" || undefined
    const isCurrent = searchParams.get("isCurrent") === "true"
    const searchTerm = searchParams.get("search") || ""

    // Mock assignment data
    const mockAssignments: RoomAssignment[] = [
      {
        id: "assign-001",
        roomId: "room-001",
        studentId: "std-001",
        assignedAt: new Date(Date.now() - 604800000).toISOString(),
        assignedBy: "admin-001",
        leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 604800000).toISOString().split("T")[0],
        isCurrent: true,
        rentAmount: 50000,
        studentName: "John Omondi",
        studentAdmission: "ADM-2024-001",
        status: "ACTIVE",
      },
      {
        id: "assign-002",
        roomId: "room-001",
        studentId: "std-002",
        assignedAt: new Date(Date.now() - 777600000).toISOString(),
        assignedBy: "admin-001",
        leaseStart: new Date(Date.now() - 777600000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 0).toISOString().split("T")[0],
        isCurrent: false,
        rentAmount: 50000,
        studentName: "Jane Doe",
        studentAdmission: "ADM-2024-002",
        status: "ACTIVE",
      },
      {
        id: "assign-003",
        roomId: "room-002",
        studentId: "std-003",
        assignedAt: new Date(Date.now() - 86400000).toISOString(),
        assignedBy: "admin-002",
        leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        isCurrent: true,
        rentAmount: 80000,
        studentName: "Peter Omondi",
        studentAdmission: "ADM-2024-003",
        status: "ACTIVE",
      },
      {
        id: "assign-004",
        roomId: "room-001",
        studentId: "std-001",
        assignedAt: new Date(Date.now() - 1036800000).toISOString(),
        assignedBy: "admin-001",
        leaseStart: new Date(Date.now() - 1036800000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        isCurrent: false,
        rentAmount: 50000,
        studentName: "John Omondi",
        studentAdmission: "ADM-2024-001",
        status: "EXPIRED",
      },
    ]

    let filteredAssignments = mockAssignments

    if (roomId) {
      filteredAssignments = filteredAssignments.filter((a) => a.roomId === roomId)
    }
    if (studentId) {
      filteredAssignments = filteredAssignments.filter((a) => a.studentId === studentId)
    }
    if (status) {
      filteredAssignments = filteredAssignments.filter((a) => a.status === status)
    }
    if (isCurrent !== undefined) {
      filteredAssignments = filteredAssignments.filter((a) => a.isCurrent === isCurrent)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredAssignments = filteredAssignments.filter(
        (a) => a.studentName.toLowerCase().includes(termLower) ||
        a.studentAdmission.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments,
    })
  } catch (error) {
    console.error("Boarding assignments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new assignment
    const newAssignment: RoomAssignment = {
      id: `assign-${Date.now().toString(36)}`,
      ...body,
      assignedAt: new Date().toISOString(),
      isCurrent: true,
      status: "ACTIVE",
    }

    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: "Assignment created successfully",
    })
  } catch (error) {
    console.error("Create assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}