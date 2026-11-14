import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { getGuardianContext } from "@/server/parent"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const gate = await getGuardianContext()
    if ("error" in gate) return gate.error
    const { guardianId, institutionId } = gate.guardian

    const links = await prisma.studentGuardian.findMany({
      where: { guardianId, institutionId },
      include: {
        student: {
          include: {
            grade: { select: { name: true } },
            invoices: { where: { amountRemaining: { gt: 0 } }, select: { amountRemaining: true } },
            roomAssignments: { where: { isCurrent: true }, select: { id: true }, take: 1 },
          },
        },
      },
    })

    const studentIds = links.map((l) => l.student.id)
    const attendanceAgg = studentIds.length
      ? await prisma.attendance.groupBy({
          by: ["studentId"],
          where: { studentId: { in: studentIds }, institutionId },
          _count: { _all: true },
        })
      : []
    const presentAgg = studentIds.length
      ? await prisma.attendance.groupBy({
          by: ["studentId"],
          where: { studentId: { in: studentIds }, institutionId, status: "PRESENT" },
          _count: { _all: true },
        })
      : []
    const totalById = new Map(attendanceAgg.map((r) => [r.studentId, r._count._all]))
    const presentById = new Map(presentAgg.map((r) => [r.studentId, r._count._all]))

    const students = links.map((link) => {
      const s = link.student
      const total = totalById.get(s.id) ?? 0
      const present = presentById.get(s.id) ?? 0
      const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0
      const feeBalance = s.invoices.reduce((sum, i) => sum + Number(i.amountRemaining), 0) / 100
      return {
        id: s.id,
        admissionNumber: s.admissionNumber ?? "",
        fullName: `${s.firstName} ${s.lastName}`.trim(),
        grade: s.grade?.name ?? "(unassigned)",
        attendancePercentage,
        feeBalance: Math.round(feeBalance),
        isBoarding: s.roomAssignments.length > 0,
      }
    })

    return NextResponse.json({ success: true, data: { students } })
  } catch (error) {
    console.error("Parent children GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to load children" }, { status: 500 })
  }
}
