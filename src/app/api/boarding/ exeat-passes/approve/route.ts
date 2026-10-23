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

interface ExeatApproveRequest {
  status: "APPROVED" | "REJECTED"
  approvedBy: string
  notes?: string
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || ""
    const body: ExeatApproveRequest = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Exeat pass ID required" },
        { status: 400 }
      )
    }

    if (body.status !== "APPROVED" && body.status !== "REJECTED") {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be APPROVED or REJECTED" },
        { status: 400 }
      )
    }

    // In production, this would update the database
    // For now, return success with the approval details
    const approvalDate = new Date().toISOString()

    return NextResponse.json({
      success: true,
      data: {
        id,
        status: body.status,
        approvedBy: body.approvedBy,
        approvedAt: approvalDate,
      },
      message: `Exeat pass ${body.status.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error("Exeat pass approval error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to approve/reject exeat pass" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock exeat pass data for approval page
    const mockPasses: any[] = [
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
        approvedBy: "Principal M.",
        approvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ]

    let filteredPasses = mockPasses

    if (status) {
      filteredPasses = filteredPasses.filter((p) => p.status === status)
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
    console.error("Exeat passes approve GET error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch exeat passes" },
      { status: 500 }
    )
  }
}