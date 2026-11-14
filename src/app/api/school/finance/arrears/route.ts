import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

const centsToKes = (v: unknown) => Number(v ?? 0) / 100

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const grouped = await prisma.invoice.groupBy({
      by: ["studentId"],
      where: { institutionId, amountRemaining: { gt: 0 } },
      _sum: { amountRemaining: true },
      _count: { _all: true },
      _min: { dueDate: true },
      orderBy: { _sum: { amountRemaining: "desc" } },
      take: 1000,
    })

    const studentIds = grouped.map((g) => g.studentId)
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        grade: { select: { name: true } },
      },
    })
    const studentMap = new Map(students.map((s) => [s.id, s]))

    const arrears = grouped.map((g) => {
      const s = studentMap.get(g.studentId)
      return {
        studentId: g.studentId,
        studentName: s ? `${s.firstName} ${s.lastName}`.trim() : "(unknown)",
        admissionNumber: s?.admissionNumber ?? "",
        grade: s?.grade?.name ?? "(unassigned)",
        outstanding: centsToKes(g._sum.amountRemaining),
        invoiceCount: g._count._all,
        earliestDueDate: g._min.dueDate?.toISOString().slice(0, 10) ?? null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        arrears,
        totalOutstanding: arrears.reduce((sum, a) => sum + a.outstanding, 0),
        learnerCount: arrears.length,
      },
    })
  } catch (error) {
    console.error("School finance arrears GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch arrears" }, { status: 500 })
  }
}
