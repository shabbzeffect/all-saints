import { NextResponse } from "next/http"

interface ExpiredAssignment {
  id: string
  studentId: string
  studentName: string
  studentAdmission: string
  grade: string
  roomNumber: string
  dormitoryName: string
  leaseEnd: string
  daysOverdue: number
  status: "EXPIRED"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Mock expired assignments data
    const mockAssignments: ExpiredAssignment[] = [
      {
        id: "expired-001",
        studentId: "std-001",
        studentName: "John Omondi",
        studentAdmission: "ADM-2024-001",
        grade: "Grade 7",
        roomNumber: "R-101",
        dormitoryName: "Boys' House",
        leaseEnd: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        daysOverdue: 30,
        status: "EXPIRED",
      },
      {
        id: "expired-002",
        studentId: "std-002",
        studentName: "Jane Doe",
        studentAdmission: "ADM-2024-002",
        grade: "Grade 8",
        roomNumber: "R-102",
        dormitoryName: "Boys' House",
        leaseEnd: new Date(Date.now() - 172800000).toISOString().split("T")[0],
        daysOverdue: 60,
        status: "EXPIRED",
      },
    ]

    return NextResponse.json({
      success: true,
      data: mockAssignments,
    })
  } catch (error) {
    console.error("Expired assignments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch expired assignments" },
      { status: 500 }
    )
  }
}