// ============================================================================
// Report Card Service - SaintsHub School Academics
// ============================================================================
// Provides: Report card generation, acknowledgment, and history

import { prisma } from "@/server/db"

export interface ReportCard {
  id: string
  studentId: string
  termId: string
  grade: string
  subject: string
  score: number
  maxScore: number
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  issuedAt: Date
  distributed: boolean
}

export interface ReportCardAcknowledgment {
  studentId: string
  acknowledgedAt: Date
  acknowledgedBy: string
}

// Generate a report card
export async function generateReportCard(
  studentId: string,
  institutionId: string,
  termId: string,
  issuedById: string
) {
  // Find the student's grade and term
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { grade: true, term: true },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  // Check if a report card already exists for this term
  const existingReportCard = await prisma.reportCard.findFirst({
    where: {
      studentId,
      termId,
    },
  })

  if (existingReportCard) {
    return NextResponse.json(
      { error: "Report card already exists for this term" },
      { status: 400 }
    )
  }

  const reportCard = await prisma.reportCard.create({
    data: {
      studentId,
      termId,
      grade: student.grade.name,
      subject: student.grade.subject || "General",
      score: 0,
      maxScore: 100,
      status: "DRAFT",
      issuedAt: new Date(),
      distributed: false,
    },
  })

  return reportCard
}

// Acknowledge a report card
export async function acknowledgeReportCard(
  studentId: string,
  acknowledgedBy: string
) {
  const acknowledgment = await prisma.reportCardAcknowledgment.create({
    data: {
      studentId,
      acknowledgedBy,
      acknowledgedAt: new Date(),
    },
  })

  return acknowledgment
}

// Get report card history
export async function getReportCardHistory(
  studentId: string,
  institutionId: string
) {
  const history = await prisma.reportCard.findMany({
    where: { studentId },
    include: { term: true },
    orderBy: { issuedAt: "desc" },
  })

  return history
}

// Get report card with acknowledgment status
export async function getReportCardWithAcknowledgment(
  studentId: string,
  institutionId: string
) {
  const reportCard = await prisma.reportCard.findFirst({
    where: { studentId },
    include: { term: true },
  })

  if (!reportCard) {
    return null
  }

  // Check if acknowledged
  const acknowledgment = await prisma.reportCardAcknowledgment.findFirst({
    where: { studentId },
  })

  return {
    ...reportCard,
    acknowledged: !!acknowledgment,
    acknowledgedAt: acknowledgment?.acknowledgedAt,
  }
}