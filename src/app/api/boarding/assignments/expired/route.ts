import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

const DAY_MS = 86_400_000

const toDto = (a: {
  id: string
  studentId: string
  leaseEnd: Date | null
  student: { firstName: string; lastName: string; admissionNumber: string | null; grade: { name: string } | null }
  room: { roomNumber: string; dormitory: { name: string } }
}) => ({
  id: a.id,
  studentId: a.studentId,
  studentName: `${a.student.firstName} ${a.student.lastName}`.trim(),
  admissionNumber: a.student.admissionNumber ?? "",
  grade: a.student.grade?.name ?? "(unassigned)",
  roomNumber: a.room.roomNumber,
  dormitoryName: a.room.dormitory.name,
  leaseEnd: a.leaseEnd ? a.leaseEnd.toISOString().slice(0, 10) : null,
  daysOverdue: a.leaseEnd ? Math.max(0, Math.floor((Date.now() - a.leaseEnd.getTime()) / DAY_MS)) : 0,
  status: "EXPIRED" as const,
})

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const now = new Date()
    const assignments = await prisma.roomAssignment.findMany({
      where: {
        leaseEnd: { lt: now },
        room: { dormitory: { institutionId } },
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true, grade: { select: { name: true } } },
        },
        room: { select: { roomNumber: true, dormitory: { select: { name: true } } } },
      },
      orderBy: { leaseEnd: "asc" },
      take: 200,
    })

    return NextResponse.json({ success: true, data: assignments.map(toDto) })
  } catch (error) {
    console.error("Expired assignments GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch expired assignments" }, { status: 500 })
  }
}
