import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { getGuardianContext } from "@/server/parent"

export const dynamic = "force-dynamic"

const overallGrade = (pct: number) =>
  pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "E"

export async function GET() {
  try {
    const gate = await getGuardianContext()
    if ("error" in gate) return gate.error
    const { guardianId, institutionId } = gate.guardian

    const links = await prisma.studentGuardian.findMany({
      where: { guardianId, institutionId },
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } } },
    })
    const studentIds = links.map((l) => l.student.id)
    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, data: { reportCards: [] } })
    }

    const cards = await prisma.reportCard.findMany({
      where: { studentId: { in: studentIds }, status: "ISSUED" },
      include: {
        term: { select: { name: true, academicYear: { select: { name: true } } } },
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 50,
    })

    const scores = studentIds.length
      ? await prisma.assessmentScore.findMany({
          where: { studentId: { in: studentIds } },
          include: { assessment: { include: { subject: { select: { name: true } } } } },
        })
      : []

    const reportCards = cards.map((card) => {
      const cardScores = scores.filter((s) => s.studentId === card.studentId && s.assessment.termId === card.termId)
      const subjects = cardScores.map((s) => ({
        name: s.assessment.subject.name,
        score: s.score,
        maxScore: s.assessment.maxScore,
        grade: s.gradeBand,
      }))
      const pct =
        subjects.length > 0
          ? Math.round(subjects.reduce((sum, s) => sum + (s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0), 0) / subjects.length)
          : 0
      return {
        id: card.id,
        term: card.term.name,
        academicYear: card.term.academicYear.name,
        issueDate: card.issuedAt.toISOString(),
        overallGrade: overallGrade(pct),
        overallScore: pct,
        subjects,
        studentName: `${card.student.firstName} ${card.student.lastName}`.trim(),
        admissionNumber: card.student.admissionNumber ?? "",
        parentAcknowledged: card.parentAcknowledged,
      }
    })

    return NextResponse.json({ success: true, data: { reportCards } })
  } catch (error) {
    console.error("Parent report-cards GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch report cards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gate = await getGuardianContext()
    if ("error" in gate) return gate.error
    const { guardianId, institutionId } = gate.guardian

    const body = await request.json().catch(() => null)
    const reportCardId = typeof body?.reportCardId === "string" ? body.reportCardId : ""
    if (!reportCardId) {
      return NextResponse.json({ success: false, error: "reportCardId is required" }, { status: 400 })
    }

    const links = await prisma.studentGuardian.findMany({
      where: { guardianId, institutionId },
      select: { studentId: true },
    })
    const studentIds = links.map((l) => l.studentId)

    const card = await prisma.reportCard.findFirst({
      where: { id: reportCardId, studentId: { in: studentIds } },
      select: { id: true },
    })
    if (!card) {
      return NextResponse.json({ success: false, error: "Report card not found" }, { status: 404 })
    }

    await prisma.reportCard.update({
      where: { id: card.id },
      data: { parentAcknowledged: true, parentAcknowledgedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: { parentAcknowledged: true } })
  } catch (error) {
    console.error("Parent report-cards POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to acknowledge report card" }, { status: 500 })
  }
}
