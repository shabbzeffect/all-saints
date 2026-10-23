import { NextResponse } from "next/http"

interface CurrentAssignment {
  id: string
  roomId: string
  studentId: string
  studentName: string
  studentAdmission: string
  grade: string
  roomNumber: string
  dormitoryName: string
  leaseStart: string
  leaseEnd: string
  isCurrent: boolean
  rentAmount: number
  daysRemaining: number
  status: "ACTIVE" | "EXPIRING_Soon" | "EXPIRED"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const roomId = searchParams.get("roomId")

    // Mock current assignment data
    const mockAssignments: CurrentAssignment[] = [
      {
        id: "curr-001",
        roomId: "room-001",
        studentId: "std-001",
        studentName: "John Omondi",
        studentAdmission: "ADM-2024-001",
        grade: "Grade 7",
        roomNumber: "R-101",
        dormitoryName: "Boys' House",
        leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 604800000).toISOString().split("T")[0],
        isCurrent: true,
        rentAmount: 50000,
        daysRemaining: 30,
        status: "ACTIVE",
      },
      {
        id: "curr-002",
        roomId: "room-002",
        studentId: "std-003",
        studentName: "Peter Omondi",
        studentAdmission: "ADM-2024-003",
        grade: "Grade 9",
        roomNumber: "R-103",
        dormitoryName: "Boys' House",
        leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        leaseEnd: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        isCurrent: true,
        rentAmount: 80000,
        daysRemaining: 45,
        status: "ACTIVE",
      },
    ]

    let filteredAssignments = mockAssignments

    if (studentId) {
      filteredAssignments = filteredAssignments.filter((a) => a.studentId === studentId)
    }
    if (roomId) {
      filteredAssignments = filteredAssignments.filter((a) => a.roomId === roomId)
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments,
    })
  } catch (error) {
    console.error("Current assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch current assignment" },
      { status: 500 }
    )
  }
}