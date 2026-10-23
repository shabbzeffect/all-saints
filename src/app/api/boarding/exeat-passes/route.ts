import { NextResponse } from "next/http"

interface ExeatPass {
  id: string
  studentId: string
  requestedBy: string
  reason: string
  startDate: string
  endDate: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  studentName: string
  studentAdmission: string
  grade: string
}

interface ExeatFilter {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
  studentId?: string
  grade?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" || undefined
    const studentId = searchParams.get("studentId") || undefined
    const grade = searchParams.get("grade") || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock exeat pass data
    const mockPasses: ExeatPass[] = [
      {
        id: "exeat-001",
        studentId: "std-001",
        requestedBy: "admin-001",
        reason: "Family function in Nairobi",
        startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        status: "APPROVED",
        approvedBy: "principal-001",
        approvedAt: new Date(Date.now() - 86400000).toISOString(),
        studentName: "John Omondi",
        studentAdmission: "ADM-2024-001",
        grade: "Grade 7",
      },
      {
        id: "exeat-002",
        studentId: "std-002",
        requestedBy: "staff-001",
        reason: "Medical appointment",
        startDate: new Date(Date.now()).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        status: "PENDING",
        studentName: "Jane Doe",
        studentAdmission: "ADM-2024-002",
        grade: "Grade 8",
      },
      {
        id: "exeat-003",
        studentId: "std-003",
        requestedBy: "parent-001",
        reason: "Family wedding",
        startDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        status: "REJECTED",
        studentName: "Peter Omondi",
        studentAdmission: "ADM-2024-003",
        grade: "Grade 9",
      },
    ]

    let filteredPasses = mockPasses

    if (status) {
      filteredPasses = filteredPasses.filter((p) => p.status === status)
    }
    if (studentId) {
      filteredPasses = filteredPasses.filter((p) => p.studentId === studentId)
    }
    if (grade) {
      filteredPasses = filteredPasses.filter((p) => p.grade === grade)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredPasses = filteredPasses.filter(
        (p) => p.studentName.toLowerCase().includes(termLower) ||
        p.reason.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredPasses,
    })
  } catch (error) {
    console.error("Boarding exeat passes error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch exeat passes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new exeat pass
    const newPass: ExeatPass = {
      id: `exeat-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newPass,
      message: "Exeat pass created successfully",
    })
  } catch (error) {
    console.error("Create exeat pass error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create exeat pass" },
      { status: 500 }
    )
  }
}