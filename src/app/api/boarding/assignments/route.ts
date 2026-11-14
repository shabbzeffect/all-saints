/* Boarding room assignments - list current assignments and create new ones.
 * Rebuilt against prisma/schema.prisma (Dormitory/Room/RoomAssignment). */
import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requireAccess, requirePermission, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

const DAY_MS = 86_400_000

const assignmentSelect = {
  student: {
    select: { firstName: true, lastName: true, admissionNumber: true, grade: { select: { name: true } } },
  },
  room: { select: { roomNumber: true, dormitory: { select: { name: true } } } },
} as const

const toDto = (a: {
  id: string
  roomId: string
  studentId: string
  leaseStart: Date
  leaseEnd: Date | null
  isCurrent: boolean
  rentAmount: number
  assignedAt: Date
  student: { firstName: string; lastName: string; admissionNumber: string | null; grade: { name: string } | null }
  room: { roomNumber: string; dormitory: { name: string } }
}) => ({
  id: a.id,
  roomId: a.roomId,
  studentId: a.studentId,
  studentName: `${a.student.firstName} ${a.student.lastName}`.trim(),
  admissionNumber: a.student.admissionNumber ?? "",
  grade: a.student.grade?.name ?? "(unassigned)",
  roomNumber: a.room.roomNumber,
  dormitoryName: a.room.dormitory.name,
  leaseStart: a.leaseStart.toISOString().slice(0, 10),
  leaseEnd: a.leaseEnd ? a.leaseEnd.toISOString().slice(0, 10) : null,
  isCurrent: a.isCurrent,
  rentAmount: a.rentAmount,
  daysRemaining: a.leaseEnd ? Math.max(0, Math.ceil((a.leaseEnd.getTime() - Date.now()) / DAY_MS)) : null,
})

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const assignments = await prisma.roomAssignment.findMany({
      where: { isCurrent: true, room: { dormitory: { institutionId } } },
      include: assignmentSelect,
      orderBy: { leaseStart: "desc" },
      take: 500,
    })

    return NextResponse.json({ success: true, data: assignments.map(toDto) })
  } catch (error) {
    console.error("Assignments GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireAccess("portal:staff:write")
    if ("error" in gate) return gate.error
    const { membership } = gate
    const institutionId = membership.institutionId

    const body = await request.json().catch(() => null)
    const admissionNumber = typeof body?.admissionNumber === "string" ? body.admissionNumber.trim() : ""
    const roomId = typeof body?.roomId === "string" ? body.roomId.trim() : ""
    const leaseStart = typeof body?.leaseStart === "string" ? body.leaseStart : ""
    const leaseEnd = typeof body?.leaseEnd === "string" ? body.leaseEnd : ""
    const rentAmount = typeof body?.rentAmount === "number" && Number.isFinite(body.rentAmount) ? body.rentAmount : 0

    if (!admissionNumber) {
      return NextResponse.json({ success: false, error: "admissionNumber is required" }, { status: 400 })
    }
    if (!roomId) {
      return NextResponse.json({ success: false, error: "roomId is required" }, { status: 400 })
    }

    const start = new Date(leaseStart)
    if (!leaseStart || Number.isNaN(start.getTime())) {
      return NextResponse.json({ success: false, error: "A valid leaseStart is required" }, { status: 400 })
    }
    let end: Date | null = null
    if (leaseEnd) {
      const parsed = new Date(leaseEnd)
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ success: false, error: "leaseEnd is not a valid date" }, { status: 400 })
      }
      if (parsed.getTime() < start.getTime()) {
        return NextResponse.json({ success: false, error: "leaseEnd cannot be before leaseStart" }, { status: 400 })
      }
      end = parsed
    }

    const student = await prisma.student.findFirst({
      where: { institutionId, admissionNumber },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
    }

    const room = await prisma.room.findFirst({
      where: { id: roomId, dormitory: { institutionId } },
      include: { dormitory: { select: { id: true, name: true, currentOccupancy: true, capacity: true } } },
    })
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found in this institution" }, { status: 404 })
    }
    if (!room.isActive) {
      return NextResponse.json({ success: false, error: "Room is inactive" }, { status: 409 })
    }
    if (room.currentStudents >= room.capacity) {
      return NextResponse.json({ success: false, error: "Room is full" }, { status: 409 })
    }

    const existing = await prisma.roomAssignment.findFirst({
      where: { studentId: student.id, isCurrent: true },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: "Student already has a current room assignment" }, { status: 409 })
    }

    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.roomAssignment.create({
        data: {
          roomId: room.id,
          dormitoryId: room.dormitoryId,
          studentId: student.id,
          assignedBy: membership.userId,
          leaseStart: start,
          leaseEnd: end,
          isCurrent: true,
          rentAmount,
        },
        include: assignmentSelect,
      })
      await tx.room.update({ where: { id: room.id }, data: { currentStudents: { increment: 1 } } })
      await tx.dormitory.update({ where: { id: room.dormitoryId }, data: { currentOccupancy: { increment: 1 } } })
      return created
    })

    await prisma.auditEvent
      .create({
        data: {
          actorId: membership.userId,
          action: "CREATE",
          targetType: "RoomAssignment",
          targetId: assignment.id,
          institutionId,
          metadata: { action: "assign_room", studentId: student.id, roomId: room.id },
        },
      })
      .catch(() => {})

    return NextResponse.json({ success: true, data: toDto(assignment), message: "Student assigned to room" }, { status: 201 })
  } catch (error) {
    console.error("Assignments POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create assignment" }, { status: 500 })
  }
}
