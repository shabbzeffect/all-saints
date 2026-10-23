import { NextResponse } from "next/http"

interface ExeatPass {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  reason: string
  requestDate: string
  startDate: string
  endDate: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approvedBy?: string
  approvedAt?: string
  daysRequested: number
}

interface ExeatFilter {
  status?: "PENDING" | "APPROVED" | "REJECTED"
  studentId?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" || undefined
    const studentId = searchParams.get("studentId") || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock exeat pass data
    const mockPasses: ExeatPass[] = [
      {
        id: "exeat-001",
        studentId: "std-001",
        studentName: "John Omondi",
        admissionNumber: "ADM-2024-001",
        grade: "Grade 7",
        reason: "Family function in Nairobi",
        requestDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
        startDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
        status: "PENDING",
        daysRequested: 2,
      },
      {
        id: "exeat-002",
        studentId: "std-002",
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-002",
        grade: "Grade 8",
        reason: "Church retreat",
        requestDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
        startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        status: "APPROVED",
        approvedBy: "principal-001",
        approvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        daysRequested: 1,
      },
      {
        id: "exeat-003",
        studentId: "std-003",
        studentName: "Peter Omondi",
        admissionNumber: "ADM-2024-003",
        grade: "Grade 9",
        reason: "Medical check-up",
        requestDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
        startDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        status: "PENDING",
        daysRequested: 3,
      },
    ]

    let filteredPasses = mockPasses

    if (status) {
      filteredPasses = filteredPasses.filter((p) => p.status === status)
    }
    if (studentId) {
      filteredPasses = filteredPasses.filter((p) => p.studentId === studentId)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredPasses = filteredPasses.filter(
        (p) => p.studentName.toLowerCase().includes(termLower) ||
        p.reason.toLowerCase().includes(termLower) ||
        p.admissionNumber.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredPasses,
    })
  } catch (error) {
    console.error("Exeat passes error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch exeat passes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new exeat pass record
    const newPass: ExeatPass = {
      id: `exeat-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      requestDate: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({
      success: true,
      data: newPass,
      message: "Exeat pass request submitted successfully",
    })
  } catch (error) {
    console.error("Create exeat pass error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create exeat pass request" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || ""
    const body = await request.json()

    // Update exeat pass status (approve/reject)
    const passIndex = MOCK_EXEAT_PASSES.findIndex((p) => p.id === id)
    if (passIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Exeat pass not found" },
        { status: 404 }
      )
    }

    MOCK_EXEAT_PASSES[passIndex] = {
      ...MOCK_EXEAT_PASSES[passIndex],
      ...body,
      status: body.status,
    }

    return NextResponse.json({
      success: true,
      data: MOCK_EXEAT_PASSES[passIndex],
      message: `Exeat pass ${body.status.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error("Update exeat pass error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update exeat pass" },
      { status: 500 }
    )
  }
}

// Mock storage for PUT updates
const MOCK_EXEAT_PASSES: ExeatPass[] = [
  {
    id: "exeat-001",
    studentId: "std-001",
    studentName: "John Omondi",
    admissionNumber: "ADM-2024-001",
    grade: "Grade 7",
    reason: "Family function in Nairobi",
    requestDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    startDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    status: "PENDING",
    daysRequested: 2,
  },
  {
    id: "exeat-002",
    studentId: "std-002",
    studentName: "Jane Doe",
    admissionNumber: "ADM-2024-002",
    grade: "Grade 8",
    reason: "Church retreat",
    requestDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    status: "APPROVED",
    approvedBy: "principal-001",
    approvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    daysRequested: 1,
  },
  {
    id: "exeat-003",
    studentId: "std-003",
    studentName: "Peter Omondi",
    admissionNumber: "ADM-2024-003",
    grade: "Grade 9",
    reason: "Medical check-up",
    requestDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    startDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    status: "PENDING",
    daysRequested: 3,
  },
]