/* Enrolment Service - SaintsHub School SIS
Handles: Student enrolment, grade promotions, term transfers
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, normalizePhone } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"
import { AdmissionStatus, GradeLevel } from "@prisma/client"

// ============================================================================
// ENROLMENT CREATION & TRANSFERS
// ============================================================================

/**
 * Create new enrolment for a student
 */
export async function createEnrolment({
  data,
  institutionId,
  createdById,
}: {
  data: {
    studentId: string
    gradeId: string
    termId: string
    admissionId?: string
    status?: string
  },
  institutionId: string
  createdById: string
}) {
  // Validate grade exists and belongs to institution
  const grade = await prisma.grade.findUnique({
    where: { id: data.gradeId, institutionId },
  })

  if (!grade) {
    throw new Error("Invalid grade for this institution")
  }

  // Validate term exists and belongs to institution
  const term = await prisma.term.findUnique({
    where: { id: data.termId, institutionId },
  })

  if (!term) {
    throw new Error("Invalid term for this institution")
  }

  // Check if student already enrolled in this grade/term
  const existing = await prisma.enrolment.findFirst({
    where: {
      studentId: data.studentId,
      gradeId: data.gradeId,
      termId: data.termId,
      institutionId,
    },
  })

  if (existing) {
    throw new Error("Student already enrolled in this grade and term")
  }

  const enrolment = await prisma.enrolment.create({
    data: {
      ...data,
      institutionId,
      status: data.status || "ACTIVE",
    },
    include: {
      student: {
        include: {
          grade: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      grade: true,
      term: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Enrolment",
      targetId: enrolment.id,
      institutionId,
      metadata: {
        action: "create_enrolment",
        student: enrolment.student.firstName,
        grade: grade.name,
        term: term.name,
      },
    },
  })

  // Notify guardian
  const student = enrolment.student
  if (student.user?.id) {
    await createNotification({
      recipientId: student.user.id,
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Enrolment Confirmation - All Saints Mushililie Academy",
      body: `Dear Parent, ${student.firstName} ${student.lastName} has been enrolled in ${grade.name} for ${term.name}. Fee statements will be issued shortly.`,
      templateId: "enrolment_confirmation",
      priority: 1,
    })
  }

  // Create background job for fee structure assignment
  await createBackgroundJob({
    type: JobType.SEND_EMAIL,
    payload: {
      type: "fee_structure_assign",
      institutionId,
      studentId: student.id,
    },
    institutionId,
    correlationId: `fee_${student.id}`,
  })

  return enrolment
}

/**
 * Transfer student to different grade/term
 */
export async function transferEnrolment({
  studentId,
  institutionId,
  fromGradeId,
  toGradeId,
  fromTermId,
  toTermId,
  transferredById,
}: {
  studentId: string
  institutionId: string
  fromGradeId: string
  toGradeId: string
  fromTermId: string
  toTermId: string
  transferredById: string
}) {
  // Check current enrolment
  const currentEnrolment = await prisma.enrolment.findFirst({
    where: {
      studentId,
      gradeId: fromGradeId,
      termId: fromTermId,
      institutionId,
    },
  })

  if (!currentEnrolment) {
    throw new Error("No current enrolment found for this student/grade/term")
  }

  // Check target grade/term exists
  const toGrade = await prisma.grade.findUnique({
    where: { id: toGradeId, institutionId },
  })

  const toTerm = await prisma.term.findUnique({
    where: { id: toTermId, institutionId },
  })

  if (!toGrade || !toTerm) {
    throw new Error("Target grade or term not found")
  }

  // Create new enrolment
  const newEnrolment = await prisma.enrolment.create({
    data: {
      institutionId,
      studentId,
      gradeId: toGradeId,
      termId: toTermId,
      status: "ACTIVE",
    },
    include: {
      student: {
        include: { grade: true, stream: true },
      },
      grade: true,
      term: true,
    },
  })

  // Archive/soft-delete old enrolment
  await prisma.enrolment.update({
    where: { id: currentEnrolment.id },
    data: {
      status: "TRANSFERRED",
      withdrawnAt: new Date(),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: transferredById,
      action: AuditAction.UPDATE,
      targetType: "Enrolment",
      targetId: newEnrolment.id,
      institutionId,
      metadata: {
        action: "transfer_enrolment",
        from_grade: fromGradeId,
        to_grade: toGradeId,
        from_term: fromTermId,
        to_term: toTermId,
      },
    },
  })

  // Notify guardian
  if (currentEnrolment.student.user?.id) {
    await createNotification({
      recipientId: currentEnrolment.student.user.id,
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Student Transfer - All Saints Mushililie Academy",
      body: `Your child has been transferred from ${currentEnrolment.grade?.name} (${currentEnrolment.term?.name}) to ${toGrade?.name} (${toTerm?.name}).`,
      templateId: "transfer_notice",
      priority: 1,
    })
  }

  return newEnrolment
}

/**
 * Get student's current enrolment
 */
export async function getStudentCurrentEnrolment({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const enrolment = await prisma.enrolment.findFirst({
    where: {
      studentId,
      institutionId,
      status: "ACTIVE",
    },
    include: {
      student: {
        include: {
          grade: true,
          stream: true,
        },
      },
      grade: true,
      term: true,
    },
    orderBy: { enrolledAt: "desc" },
  })

  return enrolment
}

/**
 * Get student's enrolment history
 */
export async function getStudentEnrolmentHistory({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const history = await prisma.enrolment.findMany({
    where: { studentId, institutionId },
    include: {
      student: {
        include: { grade: true },
      },
      grade: true,
      term: true,
    },
    orderBy: { enrolledAt: "desc" },
  })

  return history
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { GradeLevel }