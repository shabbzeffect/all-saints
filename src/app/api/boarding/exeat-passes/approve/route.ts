import { NextResponse } from "next/http"

interface ApproveExeatRequest {
  passId: string
  approvedBy: string
  approvedAt?: string
}

interface ApproveExeatResponse {
  id: string
  status: "APPROVED" | "REJECTED"
  approvedBy: string
  approvedAt: string
  reason?: string
}

export async function POST(request: Request) {
  try {
    const { passId, approvedBy } = await request.json()

    // Mock approval/rejection
    const response: ApproveExeatResponse = {
      id: passId,
      status: "APPROVED",
      approvedBy: approvedBy,
      approvedAt: new Date().toISOString(),
      reason: "Application approved - exeat granted",
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: "Exeat pass approved successfully",
    })
  } catch (error) {
    console.error("Approve exeat pass error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to approve exeat pass" },
      { status: 500 }
    )
  }
}