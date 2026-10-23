import { NextResponse } from "next/http"

interface PendingExeatPass {
  id: string
  studentId: string
  studentName: string
  studentAdmission: string
  grade: string
  reason: string
  startDate: string
  endDate: string
  requestedBy: string
  requestedAt: string
  status: "PENDING"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Mock pending exeat passes
    const mockPasses: PendingExeatPass[] = [
      {
        id: "exeat-pending-001",
        studentId: "std-002",
        studentName: "Jane Doe",
        studentAdmission: "ADM-2024-002",
        grade: "Grade 8",
        reason: "Medical appointment",
        startDate: new Date(Date.now()).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        requestedBy: "staff-001",
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        status: "PENDING",
      },
      {
        id: "exeat-pending-002",
        studentId: "std-003",
        studentName: "Peter Omondi",
        studentAdmission: "ADM-2024-003",
        grade: "Grade 9",
        reason: "Family wedding",
        startDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        requestedBy: "parent-001",
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        status: "PENDING",
      },
    ]

    return NextResponse.json({
      success: true,
      data: mockPasses,
    })
  } catch (error) {
    console.error("Pending exeat passes error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending exeat passes" },
      { status: 500 }
    )
  }
}