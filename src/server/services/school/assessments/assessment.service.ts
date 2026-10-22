/* Assessment Service - SaintsHub School SIS
Handles: Assessment creation, scoring, grade bands, report card generation
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// ASSESSMENT CREATION & SCORING
// ============================================================================

/**
 * Create a new assessment
 */
export async function createAssessment({
  data,
  institutionId,
  createdById,
}: {
  data: {
    termId: string
    gradeId: string
    subject: string
    assessmentType: "FORMATIVE" | "SUMMATIVE" | "SBA"
    title: string
    description?: string
    maxScore: number
    rubric?: {
      exceeds: string
      meets: string
      approaches: string
      below: string
    }
  },
  institutionId: string
  createdById: string
}) {
  // Validate term exists
  const term = await prisma.term.findUnique({
    where: { id: data.termId, institutionId },
  })

  if (!term) {
    throw new Error("Invalid term for this institution")
  }

  // Validate grade exists
  const grade = await prisma.grade.findUnique({
    where: { id: data.gradeId, institutionId },
  })

  if (!grade) {
    throw new Error("Invalid grade for this institution")
  }

  const assessment = await prisma.assessment.create({
    data: {
      ...data,
      institutionId,
    },
    include: {
      grade: true,
      term: true,
      scores: {
        take: 0, // Don't include existing scores
      },
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Assessment",
      targetId: assessment.id,
      institutionId,
      metadata: {
        action: "create_assessment",
        subject: data.subject,
        type: data.assessmentType,
        grade: grade.name,
      },
    },
  })

  return assessment
}

/**
 * Record assessment score for a student
 */
export async function recordAssessmentScore({
  assessmentId,
  institutionId,
  studentId,
  score,
  assessedById,
}: {
  assessmentId: string
  institutionId: string
  studentId: string
  score: number
  assessedById: string
}) {
  // Validate assessment exists and belongs to institution
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId, institutionId },
  })

  if (!assessment) {
    throw new Error("Assessment not found")
  }

  // Validate student belongs to institution
  const student = await prisma.student.findUnique({
    where: { id: studentId, institutionId },
  })

  if (!student) {
    throw new Error("Student not found in this institution")
  }

  // Check if score already recorded for this student/assessment
  const existingScore = await prisma.assessmentScore.findFirst({
    where: {
      assessmentId,
      studentId,
    },
  })

  let scoreRecord: any

  if (existingScore) {
    // Update existing score
    scoreRecord = await prisma.assessmentScore.update({
      where: { id: existingScore.id },
      data: {
        score,
        assessedBy: assessedById,
        assessedAt: new Date(),
      },
    })
  } else {
    // Create new score
    scoreRecord = await prisma.assessmentScore.create({
      data: {
        assessmentId,
        studentId,
        score,
        assessedBy: assessedById,
        assessedAt: new Date(),
      },
    })
  }

  // Calculate grade band based on rubric
  const percentage = (score / assessment.maxScore) * 100
  let gradeBand: string
  if (percentage >= 80) {
    gradeBand = "Exceeds Expectations (EE)"
  } else if (percentage >= 60) {
    gradeBand = "Meets Expectations (ME)"
  } else if (percentage >= 40) {
    gradeBand = "Approaches Expectations (AE)"
  } else {
    gradeBand = "Below Expectations (BE)"
  }

  // Update or create the score with grade band
  const finalScore = await prisma.assessmentScore.update({
    where: { id: scoreRecord.id },
    data: {
      score,
      gradeBand,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: assessedById,
      action: AuditAction.CREATE,
      targetType: "AssessmentScore",
      targetId: finalScore.id,
      institutionId,
      metadata: {
        action: "record_score",
        assessment: assessment.title,
        student: student.firstName,
        score,
        maxScore: assessment.maxScore,
        gradeBand,
        percentage: Number(percentage.toFixed(2)),
      },
    },
  })

  // Check if this assessment should trigger notifications
  if (percentage < 40) {
    // Student is struggling - notify guardian
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Academic Concern - All Saints Mushililie Academy",
      body: `Academic concern: ${student.firstName} ${student.lastName} scored ${score}/${assessment.maxScore} (${gradeBand}) in ${assessment.subject}. Please schedule a parent-teacher meeting.`,
      templateId: "academic_concern",
      priority: 2,
    })
  } else if (percentage >= 80) {
    // Student excelling - could feature in recognition
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Academic Excellence - All Saints Mushililie Academy",
      body: `Congratulations: ${student.firstName} ${student.lastName} achieved ${gradeBand} (${percentage.toFixed(1)}%) in ${assessment.subject}.`,
      templateId: "academic_excellence",
      priority: 1,
    })
  }

  return finalScore
}

/**
 * Get assessment scores for a student
 */
export async function getStudentAssessmentScores({
  studentId,
  institutionId,
  filters = {},
}: {
  studentId: string
  institutionId: string
  filters?: { assessmentType?: string; gradeBand?: string }
}) {
  const where: any = {
    studentId,
    institutionId,
    ...(filters.assessmentType && {
      assessment: { assessmentType: filters.assessmentType },
    }),
    ...(filters.gradeBand && { gradeBand: filters.gradeBand }),
  }

  const scores = await prisma.assessmentScore.findMany({
    where,
    include: {
      assessment: {
        include: { grade: true, term: true },
      },
      student: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { assessedAt: "desc" },
  })

  return scores
}

/**
 * Get assessment scores for a class/group
 */
export async function getClassAssessmentScores({
  institutionId,
  gradeId,
  assessmentId,
  filters = {},
}: {
  institutionId: string
  gradeId: string
  assessmentId?: string
  filters?: { termId?: string }
}) {
  const where: any = {
    institutionId,
    assessmentId,
    student: { gradeId },
  }

  if (filters.termId) {
    where.assessment = { termId: filters.termId }
  }

  const scores = await prisma.assessmentScore.findMany({
    where,
    include: {
      assessment: true,
      student: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { assessedAt: "desc" },
  })

  return scores
}

/**
 * Get class performance summary
 */
export async function getClassPerformanceSummary({
  institutionId,
  gradeId,
  assessmentId,
  termId,
}: {
  institutionId: string
  gradeId: string
  assessmentId?: string
  termId?: string
}) {
  const where: any = {
    institutionId,
    student: { gradeId },
    ...(assessmentId && { assessmentId }),
    ...(termId && {
      assessment: { termId },
    }),
  }

  const scores = await prisma.assessmentScore.findMany({
    where,
    include: {
      assessment: true,
      student: true,
    },
  })

  if (scores.length === 0) {
    return {
      mean: 0,
      median: 0,
      highScore: 0,
      lowScore: assessmentId ? assessmentId : 100,
      gradeDistribution: {},
      totalStudents: 0,
    }
  }

  const scoresArray = scores.map((s) => s.score)
  const totalStudents = scores.length
  const mean = scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length

  // Sort scores for median and percentiles
  const sortedScores = [...scoresArray].sort((a, b) => a - b)
  const median =
    totalStudents % 2 === 0
      ? (sortedScores[totalStudents / 2 - 1] + sortedScores[totalStudents / 2]) / 2
      : sortedScores[Math.floor(totalStudents / 2)]

  // High and low
  const highScore = Math.max(...sortedScores)
  const lowScore = Math.min(...sortedScores)

  // Grade distribution
  const distribution = {
    EE: 0, // Exceeds Expectations
    ME: 0, // Meets Expectations
    AE: 0, // Approaches Expectations
    BE: 0, // Below Expectations
  }

  scores.forEach((s) => {
    switch (s.gradeBand) {
      case "Exceeds Expectations (EE)":
        distribution.EE++
        break
      case "Meets Expectations (ME)":
        distribution.ME++
        break
      case "Approaches Expectations (AE)":
        distribution.AE++
        break
      case "Below Expectations (BE)":
        distribution.BE++
        break
    }
  })

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    highScore,
    lowScore,
    gradeDistribution: distribution,
    totalStudents,
    assessmentCount: scores.length,
  }
}

// ============================================================================
// REPORT CARD GENERATION
// ============================================================================

/**
 * Generate report card for a student
 */
export async function generateReportCard({
  studentId,
  institutionId,
  termId,
  issuedById,
}: {
  studentId: string
  institutionId: string
  termId: string
  issuedById: string
}) {
  // Get student details
  const student = await prisma.student.findUnique({
    where: { id: studentId, institutionId },
    include: {
      grade: true,
      stream: true,
      user: {
        select: { id: true, name: true, email: true },
      },
      guardians: {
        include: { guardian: true },
        where: { isPrimary: true },
      },
      enrolments: {
        include: { term: true, grade: true },
        orderBy: { enrolledAt: "desc" },
        take: 1,
      },
      assessmentScores: {
        include: {
          assessment: {
            include: { term: true, grade: true },
          },
        },
        orderBy: { assessedAt: "desc" },
        take: 6, // Last 6 assessments
      },
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  // Get current term
  const term = await prisma.term.findUnique({
    where: { id: termId, institutionId },
  })

  if (!term) {
    throw new Error("Term not found")
  }

  // Get all assessments for this student and term
  const allAssessments = await prisma.assessmentScore.findMany({
    where: {
      studentId,
      institutionId,
      assessment: { termId },
    },
    include: {
      assessment: true,
    },
    orderBy: { assessedAt: "asc" },
  })

  // Calculate performance metrics
  const scores = allAssessments.map((s) => ({
    assessment: s.assessment.title,
    subject: s.assessment.subject,
    score: s.score,
    maxScore: s.assessment?.maxScore || 100,
    percentage: ((s.score / (s.assessment?.maxScore || 100)) * 100).toFixed(1),
    gradeBand: s.gradeBand,
  }))

  // Calculate overall performance
  const validScores = scores.filter((s) => !isNaN(Number(s.percentage)))
  const overallPercentage =
    validScores.length > 0
      ? validScores.reduce((sum, s) => sum + Number(s.percentage), 0) /
        validScores.length
      : 0

  const overallGradeBand =
    overallPercentage >= 80
      ? "Exceeds Expectations (EE)"
      : overallPercentage >= 60
      ? "Meets Expectations (ME)"
      : overallPercentage >= 40
      ? "Approaches Expectations (AE)"
      : "Below Expectations (BE)"

  // Get attendance summary (would need attendance service)
  const attendanceSummary = {
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0,
  }

  // Build report card
  const reportCard = {
    student: {
      id: student.id,
      admissionNumber: student.admissionNumber,
      fullName: `${student.firstName} ${student.lastName || ""}`,
      preferredName: student.preferredName,
      grade: student.grade?.name,
      stream: student.stream?.name,
      dateOfBirth: student.dateOfBirth?.toLocaleDateString("en-KE"),
      gender: student.gender,
    },
    term: {
      name: term.name,
      startDate: term.startDate.toLocaleDateString("en-KE"),
      endDate: term.endDate.toLocaleDateString("en-KE"),
    },
    issuedAt: new Date().toLocaleDateString("en-KE"),
    issuedBy: issuedById ? "Senior Staff" : "System",

    // Subject performance
    subjects: scores,

    // Overall performance
    overallPercentage: Number(overallPercentage.toFixed(2)),
    overallGradeBand,

    // Attendance
    attendance: attendanceSummary,

    // Comments
    teacherComments: student.grade?.name
      ? `Good progress in ${student.grade.name}. Keep encouraging regular study.`
      : "No comments available",

    // Footer
    generatedAt: new Date().toISOString(),
    version: "1.0",
  }

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: issuedById,
      action: AuditAction.CREATE,
      targetType: "ReportCard",
      targetId: studentId,
      institutionId,
      metadata: {
        action: "generate_report_card",
        student: student.firstName,
        term: term.name,
        overallPercentage: Number(overallPercentage.toFixed(2)),
      },
    },
  })

  // Create background job for PDF generation
  await createBackgroundJob({
    type: JobType.GENERATE_PDF,
    payload: {
      type: "report_card_pdf",
      institutionId,
      studentId,
      reportCardData: reportCard,
    },
    institutionId,
    correlationId: `report_${studentId}_${termId}`,
  })

  return {
    reportCard,
    message: "Report card generated successfully. PDF will be generated asynchronously.",
  }
}

/**
 * Get report card history for a student
 */
export async function getReportCardHistory({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const reportCards = await prisma.reportCard.findMany({
    where: { studentId, institutionId },
    include: {
      term: true,
      grade: true,
      academicYear: true,
      issuedByUser: {
        select: { id: true, name: true },
      },
    },
    orderBy: { issuedAt: "desc" },
  })

  return reportCards
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Assessment,
  AssessmentScore,
  ReportCard,
  ClassPerformanceSummary,
}