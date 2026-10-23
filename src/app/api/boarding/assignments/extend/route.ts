import { NextResponse } from "next/http"

interface AssignmentExtend {
  assignmentId: string
  newLeaseEnd: string
  extendedBy: string
}

interface AssignmentExtendResponse {
  id: string
  newLeaseEnd: string
  daysAdded: number
  status: "ACTIVE"
}

export async function PUT(request: Request) {
  try {
    const { assignmentId, newLeaseEnd, extendedBy } = await request.json()

    // Mock assignment extension
    const leaseEndDate = new Date(newLeaseEnd)
    const currentLeaseEnd = new Date() // Would get from DB
    const msDiff = leaseEndDate.getTime() - currentLeaseEnd.getTime()
    const daysAdded = Math.floor(msDiff / (1000 * 60 * 60 * 24))

    const response: AssignmentExtendResponse = {
      id: assignmentId,
      newLeaseEnd: newLeaseEnd,
      daysAdded: daysAdded,
      status: "ACTIVE",
    }

    // In a real app, would update the assignment in the database
    // await prisma.roomAssignment.update({
    //   where: { id: assignmentId },
    //   data: { leaseEnd: newLeaseEnd }
    // })

    return NextResponse.json({
      success: true,
      data: response,
      message: "Assignment lease extended successfully",
    })
  } catch (error) {
    console.error("Extend assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to extend assignment" },
      { status: 500 }
    )
  }
}