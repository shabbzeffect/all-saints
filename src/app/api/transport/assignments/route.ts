import { NextResponse } from "next/http"

interface Assignment {
  id: string
  routeId: string
  vehicleId: string
  studentId: string
  studentName: string
  admissionNumber: string
  stopId: string
  stopName: string
  pickupTime: string
  dropoffTime: string
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  pickupDate: string
  dropoffDate: string
}

interface AssignmentFilter {
  status?: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  vehicleId?: string
  studentId?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED" || undefined
    const vehicleId = searchParams.get("vehicleId") || undefined
    const studentId = searchParams.get("studentId") || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock assignment data
    const mockAssignments: Assignment[] = [
      {
        id: "assign-001",
        routeId: "route-001",
        vehicleId: "veh-001",
        studentId: "std-001",
        studentName: "John Omondi",
        admissionNumber: "ADM-2024-001",
        stopId: "stop-001",
        stopName: "School Main Gate",
        pickupTime: "07:30",
        dropoffTime: "17:00",
        status: "ACTIVE",
        pickupDate: new Date().toISOString().split("T")[0],
        dropoffDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      },
      {
        id: "assign-002",
        routeId: "route-002",
        vehicleId: "veh-002",
        studentId: "std-002",
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-002",
        stopId: "stop-002",
        stopName: "Railways Station",
        pickupTime: "07:45",
        dropoffTime: "16:30",
        status: "ACTIVE",
        pickupDate: new Date().toISOString().split("T")[0],
        dropoffDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      },
      {
        id: "assign-003",
        routeId: "route-001",
        vehicleId: "veh-001",
        studentId: "std-003",
        studentName: "Peter Omondi",
        admissionNumber: "ADM-2024-003",
        stopId: "stop-003",
        stopName: "Westlands Roundabout",
        pickupTime: "07:35",
        dropoffTime: "16:55",
        status: "SCHEDULED",
        pickupDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        dropoffDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
      },
    ]

    let filteredAssignments = mockAssignments

    if (status) {
      filteredAssignments = filteredAssignments.filter((a) => a.status === status)
    }
    if (vehicleId) {
      filteredAssignments = filteredAssignments.filter((a) => a.vehicleId === vehicleId)
    }
    if (studentId) {
      filteredAssignments = filteredAssignments.filter((a) => a.studentId === studentId)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredAssignments = filteredAssignments.filter(
        (a) => a.studentName.toLowerCase().includes(termLower) ||
        a.admissionNumber.toLowerCase().includes(termLower) ||
        a.stopName.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments,
    })
  } catch (error) {
    console.error("Transport assignments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new assignment record
    const newAssignment: Assignment = {
      id: `assign-${Date.now().toString(36)}`,
      ...body,
      status: "SCHEDULED",
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