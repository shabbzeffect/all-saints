/* Report Card Service - SaintsHub School SIS
Handles: Report card generation, distribution, parent acknowledgment
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// REPORT CARD ISSUANCE & DISTRIBUTION
// ============================================================================

/**
 * Issue a report card to a student's guardians
 */
export async function issueReportCard({
  studentId,
  institutionId,
  termId,
  issuedById,
  distribute = true,
}: {
  studentId: string
  institutionId: string
  termId: string
  issuedById: string
  distribute: boolean
}) {
  // Check if report card already exists and is issued
  const existing = await prisma.reportCard.findFirst({
    where: { studentId, institutionId, termId },
  })

  let reportCard: any

  if (existing) {
    if (existing.status === "ISSUED") {
      // Return existing issued report card
      return {
        reportCard: existing,
        message: "Report card already issued for this term",
      }
    }
    // Update existing draft
    reportCard = await prisma.reportCard.update({
      where: { id: existing.id },
      data: {
        status: "ISSUED",
        distributedAt: new Date(),
        distributed: true,
      },
    })
  } else {
    // Create new report card
    reportCard = await prisma.reportCard.create({
      data: {
        studentId,
        institutionId,
        termId,
        status: "ISSUED",
        issuedBy: issuedById,
        distributed: distribute,
        distributedAt: distribute ? new Date() : null,
      },
      include: {
        student: {
          include: {
            grade: true,
            user: true,
          },
        },
        term: true,
        grade: true,
      },
    })
  }

  // If distributing, notify guardians
  if (distribute) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, institutionId },
      include: {
        guardians: {
          include: {
            guardian: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          where: { isPrimary: true },
        },
      },
    })

    if (student) {
      for (const sg of student.guardians) {
        if (sg.user?.id) {
          await createNotification({
            recipientId: sg.user.id,
            institutionId,
            channel: NotificationChannel.EMAIL,
            subject: "Report Card Issued - All Saints Mushililie Academy",
            body: `Dear Parent, the term report card for ${student.firstName} ${student.lastName} has been issued. Please log in to the portal to view and acknowledge receipt.`,
            templateId: "report_card_issued",
            priority: 1,
          })
        }
      }

      // Mark as distributed in DB
      await prisma.reportCard.update({
        where: { id: reportCard.id },
        data: { distributedAt: new Date(), distributed: true },
      })
    }
  }

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: issuedById,
      action: AuditAction.UPDATE,
      targetType: "ReportCard",
      targetId: studentId,
      institutionId,
      metadata: {
        action: "issue_report_card",
        term: termId,
        distributed: distribute,
      },
    },
  })

  return {
    reportCard,
    message: distribute ? "Report card issued and distributed to guardians" : "Report card marked as issued",
  }
}

/**
 * Get report card with parent acknowledgment tracking
 */
export async function getReportCardWithAcknowledgment({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const reportCard = await prisma.reportCard.findFirst({
    where: { studentId, institutionId },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true },
      },
      term: true,
      grade: true,
      issuedByUser: {
        select: { id: true, name: true },
      },
    },
    orderBy: { issuedAt: "desc" },
  })

  if (!reportCard) {
    return null
  }

  // Check parent acknowledgment status
  const guardians = await prisma.studentGuardian.findMany({
    where: { studentId, institutionId, isPrimary: true },
    include: {
      guardian: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })

  return {
    reportCard,
    guardians,
    isAcknowledged: reportCard.parentAcknowledged,
    acknowledgedBy: reportCard.parentAcknowledgedAt,
  }
}

/**
 * Mark parent acknowledgment of report card
 */
export async function acknowledgeReportCard({
  studentId,
  institutionId,
  acknowledgedByUserId,
}: {
  studentId: string
  institutionId: string
  acknowledgedByUserId: string
}) {
  const updated = await prisma.reportCard.update({
    where: { studentId, institutionId },
    data: {
      parentAcknowledged: true,
      parentAcknowledgedAt: new Date(),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: acknowledgedByUserId,
      action: AuditAction.UPDATE,
      targetType: "ReportCard",
      targetId: studentId,
      institutionId,
      metadata: {
        action: "acknowledge_report_card",
      },
    },
  })

  return updated
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { ReportCard }