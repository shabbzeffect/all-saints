import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

const kes = (v: unknown) => Number(v ?? 0) / 100

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const [
      studentsTotal,
      studentsActive,
      studentsWithdrawn,
      staffTotal,
      teacherCount,
      invoiceStats,
      paidInvoices,
      collectedStats,
      overdueStats,
      creditStats,
      arrearsByStudent,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId, status: "ACTIVE" } }),
      prisma.student.count({ where: { institutionId, status: "WITHDRAWN" } }),
      prisma.institutionMembership.count({ where: { institutionId } }),
      prisma.userRole.count({ where: { role: { key: "SCHOOL_TEACHER" }, user: { memberships: { some: { institutionId } } } } }),
      prisma.invoice.aggregate({ where: { institutionId }, _sum: { totalAmount: true } }),
      prisma.invoice.count({ where: { institutionId, status: "PAID" } }),
      prisma.payment.aggregate({ where: { institutionId }, _sum: { amount: true }, _count: true }),
      prisma.invoice.aggregate({ where: { institutionId, amountRemaining: { gt: 0 } }, _sum: { amountRemaining: true }, _count: true }),
      prisma.invoice.aggregate({ where: { institutionId, amountRemaining: { lt: 0 } }, _sum: { amountRemaining: true }, _count: true }),
      prisma.invoice.groupBy({ by: ["studentId"], where: { institutionId, amountRemaining: { gt: 0 } }, _sum: { amountRemaining: true } }),
    ])

    const studentIds = arrearsByStudent.map((r) => r.studentId)
    const studentGrades = studentIds.length
      ? await prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, grade: { select: { name: true } } } })
      : []
    const gradeById = new Map(studentGrades.map((s) => [s.id, s.grade?.name ?? "(unassigned)"]))
    const gradeArrears = new Map<string, { amount: number; learners: number }>()
    for (const row of arrearsByStudent) {
      const g = gradeById.get(row.studentId) ?? "(unassigned)"
      const cur = gradeArrears.get(g) ?? { amount: 0, learners: 0 }
      cur.amount += kes(row._sum.amountRemaining)
      cur.learners += 1
      gradeArrears.set(g, cur)
    }
    const arrearsByGrade = [...gradeArrears.entries()]
      .map(([grade, v]) => ({ grade, amount: Math.round(v.amount * 100) / 100, learners: v.learners }))
      .sort((a, b) => b.amount - a.amount)

    const invoiced = kes(invoiceStats._sum.totalAmount)
    const collected = kes(collectedStats._sum.amount)
    const outstanding = kes(overdueStats._sum.amountRemaining)
    const creditHeld = Math.abs(kes(creditStats._sum.amountRemaining))
    const collectionRate = invoiced > 0 ? (collected / invoiced) * 100 : 0
    const settleRate = studentsTotal > 0 ? (paidInvoices / studentsTotal) * 100 : 0
    const activeRate = studentsTotal > 0 ? (studentsActive / studentsTotal) * 100 : 0
    const topThreeArrears = arrearsByGrade.slice(0, 3).reduce((s, g) => s + g.amount, 0)
    const topThreeConcentration = outstanding > 0 ? (topThreeArrears / outstanding) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        school: {
          students: { total: studentsTotal, active: studentsActive, withdrawn: studentsWithdrawn },
          staff: { total: staffTotal, teachers: teacherCount },
          finance: {
            invoiced,
            collected,
            outstanding,
            collectionRate: Math.round(collectionRate),
            receipts: collectedStats._count,
            overdueStudents: overdueStats._count,
            overdueInvoices: overdueStats._count,
            creditHeld,
            creditStudents: creditStats._count,
            paidInvoices,
            settleRate: Math.round(settleRate),
            activeRate: Math.round(activeRate),
            topThreeArrears,
            topThreeConcentration: Math.round(topThreeConcentration),
          },
          arrearsByGrade,
        },
        parish: null,
      },
    })
  } catch (error) {
    console.error("Exec summary GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to build executive summary" }, { status: 500 })
  }
}
