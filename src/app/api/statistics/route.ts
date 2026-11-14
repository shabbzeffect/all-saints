import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

const kes = (v: unknown) => Number(v ?? 0) / 100

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const currentTerm = await prisma.term.findFirst({
      where: { institutionId, isCurrent: true },
      select: { id: true },
    })
    const termId = currentTerm?.id

    const [
      grades,
      students,
      guardians,
      enrolments,
      attendanceRecords,
      assessments,
      assessmentScores,
      reportCards,
      promotions,
      kpsea,
      kjsea,
      disciplineIncidents,
      clubs,
      clubMembers,
      timetables,
      invoices,
      receipts,
      budget,
      invoicedStats,
      collectedStats,
      calendarEvents,
    ] = await Promise.all([
      prisma.grade.count({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId } }),
      prisma.guardian.count({ where: { institutionId } }),
      prisma.enrolment.count({ where: { institutionId, ...(termId ? { termId } : {}) } }),
      prisma.attendance.count({ where: { institutionId } }),
      prisma.assessment.count({ where: { institutionId } }),
      prisma.assessmentScore.count({ where: { institutionId } }),
      prisma.reportCard.count({ where: { institutionId, ...(termId ? { termId } : {}) } }),
      prisma.promotion.count({ where: { institutionId, gradeFrom: "GRADE_6" } }),
      prisma.kPSEARegistration.count({ where: { institutionId } }),
      prisma.kJSEARegistration.count({ where: { institutionId } }),
      prisma.disciplineIncident.count({ where: { institutionId } }),
      prisma.club.count({ where: { institutionId } }),
      prisma.clubMember.count({ where: { institutionId } }),
      prisma.timetable.count({ where: { institutionId } }),
      prisma.invoice.count({ where: { institutionId } }),
      prisma.receipt.count({ where: { institutionId } }),
      prisma.budget.findFirst({ where: { institutionId }, orderBy: { createdAt: "desc" } }),
      prisma.invoice.aggregate({ where: { institutionId }, _sum: { totalAmount: true } }),
      prisma.payment.aggregate({ where: { institutionId }, _sum: { amount: true } }),
      prisma.schoolCalendarEvent.count({ where: { institutionId } }),
    ])

    const budgetAllocated = budget ? Number(budget.allocated) : 0
    const budgetSpent = budget ? Number(budget.spent) : 0
    const invoiced = kes(invoicedStats._sum.totalAmount)
    const collectedTotal = kes(collectedStats._sum.amount)
    const collectionRate = invoiced > 0 ? ((collectedTotal / invoiced) * 100).toFixed(1) : "0"

    return NextResponse.json({
      success: true,
      grades,
      students,
      guardians,
      enrolments,
      attendanceRecords,
      assessments,
      assessmentScores,
      reportCards,
      promotions,
      kpsea: kpsea + kjsea,
      disciplineIncidents,
      clubs,
      clubMembers,
      timetables,
      invoices,
      receipts,
      budgetAllocated,
      budgetSpent,
      collectedTotal,
      collectionRate,
      calendarEvents,
    })
  } catch (error) {
    console.error("Statistics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
