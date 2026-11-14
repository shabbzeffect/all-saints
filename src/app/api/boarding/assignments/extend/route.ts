import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

export const dynamic = "force-dynamic"

const DAY_MS = 86_400_000

export async function PUT(request: Request) {
  try {
    const gate = await requireAccess("portal:staff:write")
    if ("error" in gate) return gate.error
    const { membership } = gate
    const institutionId = membership.institutionId

    const body = await request.json().catch(() => null)
    const assignmentId = typeof body?.assignmentId === "string" ? body.assignmentId.trim() : ""
    const newLeaseEnd = typeof body?.newLeaseEnd === "string" ? body.newLeaseEnd : ""
    if (!assignmentId) {
      return NextResponse.json({ success: false, error: "assignmentId is required" }, { status: 400 })
    }

    const parsed = new Date(newLeaseEnd)
    if (!newLeaseEnd || Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ success: false, error: "A valid newLeaseEnd date is required" }, { status: 400 })
    }

    const assignment = await prisma.roomAssignment.findFirst({
      where: { id: assignmentId, room: { dormitory: { institutionId } } },
      select: { id: true, leaseEnd: true },
    })
    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found in this institution" }, { status: 404 })
    }

    const previousLeaseEnd = assignment.leaseEnd
    if (previousLeaseEnd && parsed.getTime() < previousLeaseEnd.getTime()) {
      return NextResponse.json({ success: false, error: "newLeaseEnd cannot be before the current lease end" }, { status: 400 })
    }

    const daysAdded = previousLeaseEnd
      ? Math.max(0, Math.round((parsed.getTime() - previousLeaseEnd.getTime()) / DAY_MS))
      : 0

    const updated = await prisma.roomAssignment.update({
      where: { id: assignment.id },
      data: { leaseEnd: parsed },
    })

    await prisma.auditEvent
      .create({
        data: {
          actorId: membership.userId,
          action: "UPDATE",
          targetType: "RoomAssignment",
          targetId: updated.id,
          institutionId,
          metadata: { action: "extend_assignment", newLeaseEnd: parsed.toISOString(), daysAdded },
        },
      })
      .catch(() => {})

    return NextResponse.json({
      success: true,
      data: { id: updated.id, newLeaseEnd: parsed.toISOString().slice(0, 10), daysAdded, status: "ACTIVE" },
      message: "Assignment lease extended",
    })
  } catch (error) {
    console.error("Extend assignment PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to extend assignment" }, { status: 500 })
  }
}
