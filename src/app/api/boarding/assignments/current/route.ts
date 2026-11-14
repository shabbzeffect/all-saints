import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

const DAY_MS = 86_400_000

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
}) => {
  const now = Date.now()
  const leaseEnd = a.leaseEnd
  const daysRemaining = leaseEnd ? Math.max(0, Math.ceil((leaseEnd.getTime() - now) / DAY_MS)) : null
  const status = !leaseEnd
    ? ("ACTIVE" as const)
    : leaseEnd.getTime() < now
      ? ("EXPIRED" as const)
      : daysRemaining !== null && daysRemaining <= 14
        ? ("EXPIRING_SOON" as const)
        : ("ACTIVE" as const)

  return {
    id: a.id,
    roomId: a.roomId,
    studentId: a.studentId,
    studentName: `${a.student.firstName} ${a.student.lastName}`.trim(),
    admissionNumber: a.student.admissionNumber ?? "",
    grade: a.student.grade?.name ?? "(unassigned)",
    roomNumber: a.room.roomNumber,
    dormitoryName: a.room.dormitory.name,
    leaseStart: a.leaseStart.toISOString().slice(0, 10),
    leaseEnd: leaseEnd ? leaseEnd.toISOString().slice(0, 10) : null,
    isCurrent: a.isCurrent,
    rentAmount: a.rentAmount,
    daysRemaining,
    status,
  }
}

export async function GET(request: Request) {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") ?? undefined
    const roomId = searchParams.get("roomId") ?? undefined

    const assignments = await prisma.roomAssignment.findMany({
      where: {
        isCurrent: true,
        room: { dormitory: { institutionId } },
        ...(studentId ? { studentId } : {}),
        ...(roomId ? { roomId } : {}),
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true, grade: { select: { name: true } } },
        },
        room: { select: { roomNumber: true, dormitory: { select: { name: true } } } },
      },
      orderBy: { leaseStart: "desc" },
      take: 500,
    })

    return NextResponse.json({ success: true, data: assignments.map(toDto) })
  } catch (error) {
    console.error("Current assignments GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch current assignments" }, { status: 500 })
  }
}
