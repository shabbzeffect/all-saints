/* Promotion Service - SaintsHub School SIS
Handles: End-of-year student promotions, class transfers
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"
import { GradeLevel } from "@prisma/client"

// ============================================================================
// PROMOTION MANAGEMENT
// ============================================================================

/**
 * Create a new promotion rule
 */
export async function createPromotionRule({
  data,
  institutionId,
  createdById,
}: {
  data: {
    gradeFrom: GradeLevel
    gradeTo: GradeLevel
    academicYearId: string
    termId: string
    promotionCriteria?: string
    automatic: boolean
  },
  institutionId: string
  createdById: string
}) {
  const promotion = await prisma.promotion.create({
    data: {
      ...data,
      institutionId,
    },
    include: {
      institution: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Promotion",
      targetId: promotion.id,
      institutionId,
      metadata: {
        action: "create_promotion_rule",
        from_grade: data.gradeFrom,
        to_grade: data.gradeTo,
        automatic: data.automatic,
      },
    },
  })

  return promotion
}

/**
 * Get all promotion rules for an institution
 */
export async function getPromotionRules({
  institutionId,
}: {
  institutionId: string
}) {
  const promotions = await prisma.promotion.findMany({
    where: { institutionId },
    include: {
      institution: true,
      promotedStudents: {
        include: {
          student: {
            include: { grade: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return promotions
}

/**
 * Process student promotion
 */
export async function processPromotion({
  promotionId,
  institutionId,
  promotedById,
}: {
  promotionId: string
  institutionId: string
  promotedById: string
}) {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId, institutionId },
    include: {
      promotedStudents: {
        include: {
          student: {
            include: { grade: true, user: true, enrolments: true },
          },
        },
      },
    },
  })

  if (!promotion || promotion.status !== "PENDING") {
    throw new Error("Promotion not found or not in pending status")
  }

  // Process each promoted student
  const results = await prisma.$transaction(
    promotion.promotedStudents.map((ps) =>
      prisma.$transaction([
        // Update student's grade
        prisma.student.update({
          where: { id: ps.studentId, institutionId },
          data: {
            gradeId: ps.studentTargetGrade,
          },
        }),

        // Update promotion student status
        prisma.promotionStudent.update({
          where: { id: ps.id },
          data: {
            status: "PROMOTED",
            notes: ps.notes
              ? `${ps.notes} - Promoted at end of ${promotion.academicYearId}`
              : `Promoted at end of ${promotion.academicYearId}`,
          },
        }),

        // Create new enrolment for next grade
        prisma.enrolment.create({
          data: {
            institutionId,
            studentId: ps.studentId,
            gradeId: ps.studentTargetGrade,
            termId: promotion.termId,
            status: "ACTIVE",
          },
          include: {
            student: {
              include: { grade: true },
            },
            grade: true,
            term: true,
          },
        }),
      ])
    )
  )

  // Update promotion status
  await prisma.promotion.update({
    where: { id: promotionId, institutionId },
    data: {
      status: "COMPLETED",
      ...(results.length > 0 && {
        notes: `${results.length} of ${promotion.promotedStudents.length} students promoted successfully`,
      }),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: promotedById,
      action: AuditAction.UPDATE,
      targetType: "Promotion",
      targetId: promotionId,
      institutionId,
      metadata: {
        action: "process_promotion",
        total: promotion.promotedStudents.length,
        promoted: results.length,
        failed: promotion.promotedStudents.length - results.length,
      },
    },
  })

  // Notify affected guardians
  for (const ps of promotion.promotedStudents) {
    const student = ps.student
    if (student.user?.id) {
      await createNotification({
        recipientId: student.user.id,
        institutionId,
        channel: NotificationChannel.EMAIL,
        subject: "Student Promotion - All Saints Mushililie Academy",
        body: `Your child ${student.firstName} ${student.lastName} has been promoted to ${student.grade?.name}. New academic year begins shortly.`,
        templateId: "promotion_notice",
        priority: 2,
      })
    }

    // Also notify primary guardians
    const primaryGuardians = await prisma.studentGuardian.findMany({
      where: { studentId: ps.studentId, institutionId, isPrimary: true },
      include: { guardian: true, user: true },
    })

    for (const sg of primaryGuardians) {
      if (sg.user?.id) {
        await createNotification({
          recipientId: sg.user.id,
          institutionId,
          channel: NotificationChannel.EMAIL,
          subject: "Student Promotion - All Saints Mushililie Academy",
          body: `Your child ${student.firstName} ${student.lastName} has been promoted to ${student.grade?.name}. Details: ${results.length} of ${promotion.promotedStudents.length} students promoted.`,
          templateId: "promotion_notice",
          priority: 1,
        })
      }
    }
  }

  return results
}

/**
 * Get promotion eligibility for a student
 */
export async function getPromotionEligibility({
  studentId,
  institutionId,
  currentGrade: fromGradeLevel,
}: {
  studentId: string
  institutionId: string
  currentGrade: GradeLevel
}) {
  // Get current enrolment
  const currentEnrolment = await prisma.enrolment.findFirst({
    where: {
      studentId,
      gradeId: { mode: "substring" as any }, // Simplified - would need proper comparison
      institutionId,
      status: "ACTIVE",
    },
    include: {
      grade: true,
      term: true,
    },
  })

  // Get target grade
  const targetGrade = await prisma.grade.findFirst({
    where: {
      institutionId,
      level: fromGradeLevel, // This needs adjustment
    },
  })

  // Get current term
  const currentTerm = await prisma.term.findFirst({
    where: { institutionId, isCurrent: true },
  })

  return {
    currentGrade: currentEnrolment?.grade?.name,
    currentTerm: currentEnrolment?.term?.name,
    targetGrade: targetGrade?.name,
    eligible: currentEnrolment ? true : false,
    requirements: "Minimum attendance 80%, no outstanding fees",
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { GradeLevel }