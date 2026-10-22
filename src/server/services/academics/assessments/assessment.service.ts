/* Assessment Service - SaintsHub Academics
Handles: Assessment creation, CBC rubric scoring, grade bands, analysis
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// ASSESSMENT CREATION
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
    subjectId: string
    assessmentType: AssessmentType
    title: string
    description?: string
    maxScore: number
    rubric?: {
      exceeds: string  // EE - Exceeds Expectations
      meets: string    // ME - Meets Expectations
      approaches: string // AE - Approaches Expectations
      below: string    // BE - Below Expectations
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

  // Validate subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId, institutionId },
  })

  if (!subject) {
    throw new Error("Invalid subject for this institution")
  }

  const assessment = await prisma.assessment.create({
    data: {
      ...data,
      institutionId,
    },
    include {
      subject: true,
      grade: true,
      term: true,
      scores: {
        take: 0,
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
        subject: subject.name,
        grade: grade.name,
        type: data.assessmentType,
      },
    },
  })

  // Create background job for template notifications
  await createBackgroundJob({
    type: JobType.GENERATE_PDF,
    payload: {
      type: "assessment_schedule",
      institutionId,
      assessmentId: assessment.id,
    },
    institutionId,
    correlationId: `assessment_${assessment.id}`,
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
  gradeBand,
}: {
  assessmentId: string
  institutionId: string
  studentId: string
  score: number
  assessedById: string
  gradeBand?: AssessmentScoreBand
}) {
  // Validate assessment exists
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

  // Determine grade band if not provided
  const percentage = (score / assessment.maxScore) * 100
  let finalGradeBand: AssessmentScoreBand

  if (!gradeBand) {
    if (percentage >= 80) {
      finalGradeBand = "EXCEEDS"
    } else if (percentage >= 60) {
      finalGradeBand = "MEETS"
    } else if (percentage >= 40) {
      finalGradeBand = "APPROACHES"
    } else {
      finalGradeBand = "BELOW"
    }
  } else {
    finalGradeBand = gradeBand
  }

  // Check if score already recorded
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
        gradeBand: finalGradeBand,
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
        gradeBand: finalGradeBand,
        assessedBy: assessedById,
        assessedAt: new Date(),
      },
    })
  }

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: assessedById,
      action: AuditAction.CREATE,
      targetType: "AssessmentScore",
      targetId: scoreRecord.id,
      institutionId,
      metadata: {
        action: "record_score",
        assessment: assessment.title,
        student: student.firstName,
        score,
        maxScore: assessment.maxScore,
        percentage: Number(percentage.toFixed(2)),
        gradeBand: finalGradeBand,
      },
    },
  })

  // Trigger notifications based on performance
  if (percentage < 40) {
    // Student struggling - notify guardian
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Academic Concern - All Saints Mushililie Academy",
      body: `Concern: ${student.firstName} ${student.lastName} scored ${score}/${assessment.maxScore} (${finalGradeBand}) in ${assessment.subject?.name}. Please schedule a parent-teacher meeting.`,
      templateId: "academic_concern",
      priority: 2,
    })
  } else if (percentage >= 80) {
    // Student excelling
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Academic Excellence - All Saints Mushililie Academy",
      body: `Congratulations: ${student.firstName} ${student.lastName} achieved ${finalGradeBand} (${percentage.toFixed(1)}%) in ${assessment.subject?.name}.`,
      templateId: "academic_excellence",
      priority: 1,
    })
  }

  return scoreRecord
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
  filters?: { assessmentType?: AssessmentType; gradeBand?: AssessmentScoreBand }
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
    include {
      assessment: {
        include {
          subject: true,
          grade: true,
          term: true,
        },
      },
      student: {
        select: { id: true, firstName: true, lastName: true, admissionNumber: true },
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
    include {
      assessment: true,
      student: true,
    },
  })

  if (scores.length === 0) {
    return {
      mean: 0,
      median: 0,
      highScore: 0,
      lowScore: 100,
      gradeDistribution: {
        EXCEEDS: 0,
        MEETS: 0,
        APPROACHES: 0,
        BELOW: 0,
      },
      totalStudents: 0,
    }
  }

  const scoresArray = scores.map((s) => s.score)
  const totalStudents = scores.length
  const mean = scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length

  // Sort scores for median
  const sortedScores = [...scoresArray].sort((a, b) => a - b)
  const median =
    totalStudents % 2 === 0
      ? (sortedScores[totalStudents / 2 - 1] + sortedScores[totalStudents / 2]) / 2
      : sortedScores[Math.floor(totalStudents / 2)]

  const highScore = Math.max(...sortedScores)
  const lowScore = Math.min(...sortedScores)

  // Grade distribution
  const distribution = {
    EXCEEDS: 0,
    MEETS: 0,
    APPROACHES: 0,
    BELOW: 0,
  }

  scores.forEach((s) => {
    switch (s.gradeBand) {
      case "EXCEEDS":
        distribution.EXCEEDS++
        break
      case "MEETS":
        distribution.MEETS++
        break
      case "APPROACHES":
        distribution.APPROACHES++
        break
      case "BELOW":
        distribution.BELOW++
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
// REPORT CARD SERVICE
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
    include {
      grade: true,
      stream: true,
      user: {
        select: { id: true, name: true, email: true },
      },
      guardians {
        include: { guardian: true },
        where: { isPrimary: true },
      },
      enrolments {
        include: { term: true, grade: true },
        orderBy: { enrolledAt: "desc" },
        take: 1,
      },
      assessmentScores {
        include {
          assessment: {
            include {
              subject: true,
              term: true,
            },
          },
        },
        orderBy: { assessedAt: "desc" },
        take: 20,
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

  // Get all assessment scores for this student and term
  const allScores = await prisma.assessmentScore.findMany({
    where {
      studentId,
      institutionId,
      assessment: { termId },
    },
    include {
      assessment: {
        include {
          subject: true,
          term: true,
        },
      },
    },
    orderBy: { assessedAt: "asc" },
  })

  // Build subject performance data
  const subjects = allScores.map((s) => ({
    subject: s.assessment?.subject?.name || "Unknown",
    score: s.score,
    maxScore: s.assessment?.maxScore || 100,
    percentage: ((s.score / (s.assessment?.maxScore || 100)) * 100).toFixed(1),
    gradeBand: s.gradeBand,
  })

  // Calculate overall performance
  const validScores = subjects.filter(
    (s) => !isNaN(Number(s.percentage))
  )
  const overallPercentage =
    validScores.length > 0
      ? validScores.reduce(
          (sum, s) => sum + Number(s.percentage),
          0
        ) / validScores.length
      : 0

  const overallGradeBand:
    | "EXCEEDS"
    | "MEETS"
    | "APPROACHES"
    | "BELOW" =
    overallPercentage >= 80
      ? "EXCEEDS"
      : overallPercentage >= 60
      ? "MEETS"
      : overallPercentage >= 40
      ? "APPROACHES"
      : "BELOW"

  // Get attendance summary
  const attendanceRecords = await prisma.attendance.findMany({
    where {
      studentId,
      institutionId,
    },
  })

  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter(
    (r) => r.status === "PRESENT"
  ).length
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  // Build report card data
  const reportCardData = {
    student: {
      id: student.id,
      admissionNumber: student.admissionNumber,
      fullName: `${student.firstName} ${student.lastName || ""}`,
      preferredName: student.preferredName,
      grade: student.grade?.name,
      stream: student.stream?.name,
      dateOfBirth: student.dateOfBirth?.toLocaleDateString("en-KE"),
      gender: student.gender,
      admissionDate: student.admissionDate
        ? student.admissionDate.toLocaleDateString("en-KE")
        : "",
    },
    term: {
      name: term.name,
      startDate: term.startDate.toLocaleDateString("en-KE"),
      endDate: term.endDate.toLocaleDateString("en-KE"),
    },
    issuedAt: new Date().toLocaleDateString("en-KE"),
    issuedBy: issuedById ? "Senior Staff" : "System",

    subjects,

    overallPercentage: Number(overallPercentage.toFixed(2)),
    overallGradeBand,

    attendance: {
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      attendancePercentage: Number(attendancePercentage.toFixed(2)),
    },

    teacherComments: student.grade?.name
      ? `Good progress in ${student.grade.name}. Keep encouraging regular study and completion of assignments.`
      : "No comments available",

    generatedAt: new Date().toISOString(),
    version: "1.0",
    cbcCompliant: true,
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
      reportCardData: reportCardData,
    },
    institutionId,
    correlationId: `report_${studentId}_${termId}`,
  })

  return {
    reportCardData,
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
    include {
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
// TIMETABLE SERVICE
// ============================================================================

/**
 * Create a timetable
 */
export async function createTimetable({
  data,
  institutionId,
  createdById,
}: {
  data: {
    gradeId?: string
    termId: string
    name: string
    description?: string
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

  const timetable = await prisma.timetable.create({
    data: {
      ...data,
      institutionId,
    },
    include {
      timetableLines: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Timetable",
      targetId: timetable.id,
      institutionId,
      metadata: {
        action: "create_timetable",
        name: data.name,
        term: data.termId,
      },
    },
  })

  return timetable
}

/**
 * Get timetables for an institution
 */
export async function getTimetables({
  institutionId,
  gradeId,
  termId,
}: {
  institutionId: string
  gradeId?: string
  termId?: string
}) {
  const where: any = { institutionId }

  if (gradeId) {
    where.gradeId = gradeId
  }

  if (termId) {
    where.termId = termId
  }

  const timetables = await prisma.timetable.findMany({
    where,
    include {
      timetableLines: {
        include {
          subject: true,
          teacher: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return timetables
}

/**
 * Create timetable line
 */
export async function createTimetableLine({
  data,
  institutionId,
  createdById,
}: {
  data: {
    timetableId: string
    dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
    period: number
    subjectId: string
    teacherId?: string
    classroom?: string
    isDoublePeriod?: boolean
  },
  institutionId: string
  createdById: string
}) {
  // Validate subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId, institutionId },
  })

  if (!subject) {
    throw new Error("Invalid subject for this institution")
  }

  const timetableLine = await prisma.timetableLine.create({
    data: {
      ...data,
      institutionId,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "TimetableLine",
      targetId: timetableLine.id,
      institutionId,
      metadata: {
        action: "create_timetable_line",
        day: data.dayOfWeek,
        period: data.period,
        subject: subject.name,
      },
    },
  })

  return timetableLine
}

// ============================================================================
// LESSON PLAN SERVICE
// ============================================================================

/**
 * Create a lesson plan
 */
export async function createLessonPlan({
  data,
  institutionId,
  createdById,
}: {
  data: {
    gradeId: string
    subjectId: string
    termId: string
    weekNumber: number
    title: string
    description?: string
    objectives?: string[]
    activities?: string[]
    resources?: string[]
  },
  institutionId: string
  createdById: string
}) {
  // Validate grade exists
  const grade = await prisma.grade.findUnique({
    where: { id: data.gradeId, institutionId },
  })

  if (!grade) {
    throw new Error("Invalid grade for this institution")
  }

  // Validate subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId, institutionId },
  })

  if (!subject) {
    throw new Error("Invalid subject for this institution")
  }

  // Validate term exists
  const term = await prisma.term.findUnique({
    where: { id: data.termId, institutionId },
  })

  if (!term) {
    throw new Error("Invalid term for this institution")
  }

  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      ...data,
      institutionId,
    },
    include {
      subject: true,
      grade: true,
      term: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "LessonPlan",
      targetId: lessonPlan.id,
      institutionId,
      metadata: {
        action: "create_lesson_plan",
        title: data.title,
        grade: grade.name,
        subject: subject.name,
        week: data.weekNumber,
      },
    },
  })

  return lessonPlan
}

/**
 * Get lesson plans for a grade/subject
 */
export async function getLessonPlans({
  institutionId,
  gradeId,
  subjectId,
  termId,
}: {
  institutionId: string
  gradeId?: string
  subjectId?: string
  termId?: string
}) {
  const where: any = { institutionId }

  if (gradeId) {
    where.gradeId = gradeId
  }

  if (subjectId) {
    where.subjectId = subjectId
  }

  if (termId) {
    where.termId = termId
  }

  const lessonPlans = await prisma.lessonPlan.findMany({
    where,
    include {
      subject: true,
      grade: true,
      term: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return lessonPlans
}

// ============================================================================
// DISCIPLINE SERVICE
// ============================================================================

/**
 * Log a discipline incident
 */
export async function logDisciplineIncident({
  data,
  institutionId,
  reportedById,
}: {
  data: {
    studentId: string
    category: DisciplineCategory
    actionTaken: DisciplineAction
    description?: string
    severity?: number
  },
  institutionId: string
  reportedById: string
}) {
  // Validate student exists
  const student = await prisma.student.findUnique({
    where: { id: data.studentId, institutionId },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const incident = await prisma.disciplineIncident.create({
    data: {
      ...data,
      institutionId,
      date: new Date(),
    },
    include {
      student: {
        include: { grade: true },
      },
      teacher: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: reportedById,
      action: AuditAction.CREATE,
      targetType: "DisciplineIncident",
      targetId: incident.id,
      institutionId,
      metadata: {
        action: "log_discipline_incident",
        student: student.firstName,
        category: data.category,
        action: data.actionTaken,
      },
    },
  })

  // If parent should be notified
  if (incident.parentNotified || severity && severity >= 4) {
    // Find primary guardians
    const guardians = await prisma.studentGuardian.findMany({
      where: { studentId: data.studentId, institutionId, isPrimary: true },
      include { guardian: true, user: true },
    })

    for (const sg of guardians) {
      if (sg.user?.id) {
        const severityText = severity && severity >= 4 ? "HIGH" : "MEDIUM"
        await createNotification({
          recipientId: sg.user.id,
          institutionId,
          channel: NotificationChannel.EMAIL,
          subject: `Discipline Incident - ${student.firstName} ${student.lastName}`,
          body: `A ${data.category} incident has been recorded for ${student.firstName}. Action taken: ${data.actionTaken}. Severity: ${severityText}.`,
          templateId: "discipline_incident",
          priority: severity && severity >= 4 ? 3 : 1,
        })
      }
    }
  }

  return incident
}

/**
 * Get discipline incident history for a student
 */
export async function getDisciplineHistory({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const incidents = await prisma.disciplineIncident.findMany({
    where: { studentId, institutionId },
    include {
      teacher: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "desc" },
  })

  return {
    incidents,
    total: incidents.length,
  }
}

// ============================================================================
// CLUB SERVICE
// ============================================================================

/**
 * Create a club
 */
export async function createClub({
  data,
  institutionId,
  createdById,
}: {
  data: {
    name: string
    type: ClubType
    description?: string
    leaderId?: string
    meetingSchedule?: string
  },
  institutionId: string
  createdById: string
}) {
  const club = await prisma.club.create({
    data: {
      ...data,
      institutionId,
    },
    include {
      leader: {
        select: { id: true, name: true },
      },
      clubMembers: {
        take: 0,
      },
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Club",
      targetId: club.id,
      institutionId,
      metadata: {
        action: "create_club",
        name: data.name,
        type: data.type,
      },
    },
  })

  return club
}

/**
 * Get clubs for an institution
 */
export async function getClubs({
  institutionId,
}: {
  institutionId: string
}) {
  const clubs = await prisma.club.findMany({
    where: { institutionId, isActive: true },
    include {
      leader: {
        select: { id: true, name: true },
      },
      clubMembers: {
        include {
          student: {
            include: { grade: true },
          },
        },
        where: { isActive: true },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return clubs
}

/**
 * Add student to club
 */
export async function addClubMember({
  data,
  institutionId,
  createdById,
}: {
  data: {
    studentId: string
    clubId: string
    role?: string
  },
  institutionId: string
  createdById: string
}) {
  // Check if membership already exists
  const existing = await prisma.clubMember.findFirst({
    where: {
      studentId: data.studentId,
      clubId: data.clubId,
      institutionId,
    },
  })

  if (existing) {
    // Update existing
    const updated = await prisma.clubMember.update({
      where: { id: existing.id },
      data: {
        role: data.role,
        isActive: true,
        joinedAt: new Date(),
      },
    })

    return updated
  }

  // Create new membership
  const membership = await prisma.clubMember.create({
    data: {
      ...data,
      institutionId,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "ClubMember",
      targetId: membership.id,
      institutionId,
      metadata: {
        action: "add_club_member",
        student: membership.studentId,
        club: membership.clubId,
      },
    },
  })

  return membership
}

// ============================================================================
// KPSEA/KJSEA SERVICE
// ============================================================================

/**
 * Register student for KPSEA (Grade 6)
 */
export async function registerKPSEA({
  data,
  institutionId,
  registeredById,
}: {
  data: {
    studentId: string
    registrationNumber: string
    targetSecondarySchool?: string
  },
  institutionId: string
  registeredById: string
}) {
  // Validate student exists and is in Grade 6 or equivalent
  const student = await prisma.student.findUnique({
    where: { id: data.studentId, institutionId },
    include { grade: true },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const gradeLevel = student.grade?.level || ""
  const isGrade6 =
    gradeLevel === "GRADE_6" ||
    (gradeLevel.includes("6") && !gradeLevel.includes("7"))

  if (!isGrade6) {
    throw new Error(
      "KPSEA registration is only for Grade 6 students"
    )
  }

  // Check if already registered
  const existing = await prisma.kpsearRegistration.findFirst({
    where: { studentId: data.studentId, institutionId },
  })

  if (existing) {
    throw new Error("Student already registered for KPSEA")
  }

  const registration = await prisma.kpsearRegistration.create({
    data: {
      ...data,
      institutionId,
      entryYear: new Date().getFullYear(),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: registeredById,
      action: AuditAction.CREATE,
      targetType: "KPSEARegistration",
      targetId: registration.id,
      institutionId,
      metadata: {
        action: "register_kpsea",
        student: student.firstName,
        registrationNumber: data.registrationNumber,
      },
    },
  })

  return registration
}

/**
 * Register student for KJSEA (Grade 9)
 */
export async function registerKJSEA({
  data,
  institutionId,
  registeredById,
}: {
  data: {
    studentId: string
    registrationNumber: string
    targetSecondarySchool?: string
  },
  institutionId: string
  registeredById: string
}) {
  // Validate student exists
  const student = await prisma.student.findUnique({
    where: { id: data.studentId, institutionId },
    include { grade: true },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const gradeLevel = student.grade?.level || ""
  const isGrade9 =
    gradeLevel === "GRADE_9" ||
    (gradeLevel.includes("9") && !gradeLevel.includes("10"))

  if (!isGrade9) {
    throw new Error(
      "KJSEA registration is only for Grade 9 students"
    )
  }

  // Check if already registered
  const existing = await prisma.kjseaRegistration.findFirst({
    where: { studentId: data.studentId, institutionId },
  })

  if (existing) {
    throw new Error("Student already registered for KJSEA")
  }

  const registration = await prisma.kjseaRegistration.create({
    data: {
      ...data,
      institutionId,
      entryYear: new Date().getFullYear(),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: registeredById,
      action: AuditAction.CREATE,
      targetType: "KJSEARegistration",
      targetId: registration.id,
      institutionId,
      metadata: {
        action: "register_kjsea",
        student: student.firstName,
        registrationNumber: data.registrationNumber,
      },
    },
  })

  return registration
}

/**
 * Get KPSEA/KJSEA registration status
 */
export async function getRegistrationStatus({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const kpsea = await prisma.kpsearRegistration.findFirst({
    where: { studentId, institutionId },
  })

  const kjsea = await prisma.kjseaRegistration.findFirst({
    where: { studentId, institutionId },
  })

  return {
    kpsea,
    kjsea,
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Assessment,
  AssessmentScore,
  ReportCard,
  Timetable,
  TimetableLine,
  LessonPlan,
  DisciplineIncident,
  Club,
  ClubMember,
  KPSEARegistration,
  KJSEARegistration,
  AssessmentType,
  AssessmentScoreBand,
  DisciplineCategory,
  DisciplineAction,
  ClubType
}