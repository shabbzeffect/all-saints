"use server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const institutionId = process.env.NEXT_PUBLIC_INSTITUTION_ID || ""
    
    // Run all counts in parallel
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
      transactions,
      calendarEvents,
    ] = await Promise.all([
      // 1. Grades
      prisma.grade.count({ where: { institutionId } }),
      
      // 2. Students (target 120)
      prisma.student.count({ where: { institutionId } }),
      
      // 3. Guardians linked
      prisma.guardian.count({ where: { institutionId } }),
      
      // 4. Enrolments (Term 1)
      prisma.enrolment.count({ where: { institutionId, termId: "term1" } }),
      
      // 5. Attendance records
      prisma.attendance.count({ where: { institutionId } }),
      
      // 6. Assessments (1 per grade due to @unique schema limit)
      prisma.assessment.count({ where: { institutionId } }),
      
      // 7. Assessment scores
      prisma.assessmentScore.count({ where: { institutionId } }),
      
      // 8. Report cards (Term 1, first 40 students)
      prisma.reportCard.count({ where: { institutionId, termId: "term1" } }),
      
      // 9. Promotions GRADE_6 → GRADE_7
      prisma.promotion.count({
        where: {
          institutionId,
          gradeFrom: "GRADE_6",
        },
      }),
      
      // 10. National exam registrations
      prisma.kPSEARegistration.count({ where: { institutionId } }),
      prisma.kJSEARegistration.count({ where: { institutionId } }),
      
      // 11. Discipline incidents
      prisma.disciplineIncident.count({ where: { institutionId } }),
      
      // 12. Clubs
      prisma.club.count({ where: { institutionId } }),
      prisma.clubMember.count({ where: { institutionId } }),
      
      // 13. Timetables
      prisma.timetable.count({ where: { institutionId } }),
      
      // 14. Invoices
      prisma.invoice.count({ where: { institutionId } }),
      prisma.receipt.count({ where: { institutionId } }),
      
      // 15. Budget
      prisma.budget.findFirst({
        where: { institutionId },
        orderBy: { createdAt: "desc" },
      }),
      
      // 16. Transactions
      prisma.transaction.count({ where: { institutionId } }),
      
      // 17. School calendar events
      prisma.schoolCalendarEvent.count({ where: { institutionId } }),
    ])
    
    // Calculate finance totals from transactions if budget not found
    let budgetAllocated = 8500000
    let budgetSpent = 3120000
    let collectedTotal = 0
    
    if (budget) {
      budgetAllocated = Number(budget.allocated) || 8500000
      budgetSpent = Number(budget.spent) || 3120000
    }
    
    // Calculate collected from transactions
    if (transactions > 0) {
      const txns = await prisma.transaction.findMany({
        where: { institutionId, type: "INCOME" },
        select: { amount: true },
      })
      collectedTotal = txns.reduce((sum, tx) => sum + Number(tx.amount), 0)
    }
    
    const collectionRate = budgetAllocated > 0 ? ((collectedTotal / budgetAllocated) * 100).toFixed(1) : "0"
    
    return new Response(
      JSON.stringify({
        grades,
        students,
        guardians,
        enrolments,
        attendanceRecords,
        assessments,
        assessmentScores,
        reportCards,
        promotions,
        kpsea: kpsea + kjsea, // total national exam registrations
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
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Statistics API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch statistics" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}