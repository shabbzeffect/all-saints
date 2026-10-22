/* Admissions Service - SaintsHub School SIS
Handles: Full admissions pipeline, applicant management, status workflow
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, normalizePhone } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"
import { AdmissionStatus, GradeLevel } from "@prisma/client"

// ============================================================================
// ADMISSION PIPELINE MANAGEMENT
// ============================================================================

/**
 * Create admission inquiry
 */
export async function createAdmissionInquiry({
  data,
  institutionId,
  createdById,
}: {
  data: {
    applicantFirstName: string
    applicantLastName?: string
    applicantOtherNames?: string
    applicantEmail?: string
    applicantPhone?: string
    currentSchool?: string
    gradeApplyingFor: GradeLevel
    source: "PORTAL" | "WALK_IN" | "REFERRAL" | "AGENT"
    referredBy?: string
    notes?: string
  },
  institutionId: string
  createdById: string
}) {
  const admission = await prisma.admission.create({
    data: {
      ...data,
      applicantPhone: data.applicantPhone ? normalizePhone(data.applicantPhone) : undefined,
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
      targetType: "Admission",
      targetId: admission.id,
      institutionId,
      metadata: {
        action: "create_admission_inquiry",
        source: data.source,
        grade: data.gradeApplyingFor,
      },
    },
  })

  // Create background job for auto-response
  await createBackgroundJob({
    type: JobType.SEND_EMAIL,
    payload: {
      type: "admission_inquiry_acknowledgement",
      institutionId,
      admissionId: admission.id,
    },
    institutionId,
    correlationId: `admission_${admission.id}`,
  })

  return admission
}

/**
 * Update admission status through workflow
 */
export async function updateAdmissionStatus({
  admissionId,
  institutionId,
  newStatus,
  updatedById,
  notes,
}: {
  admissionId: string
  institutionId: string
  newStatus: AdmissionStatus
  updatedById: string
  notes?: string
}) {
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId, institutionId },
  })

  if (!admission) {
    throw new Error("Admission not found")
  }

  const previousStatus = admission.admissionStatus

  const updated = await prisma.admission.update({
    where: { id: admissionId, institutionId },
    data: {
      admissionStatus: newStatus,
      ...(notes && { notes }),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: updatedById,
      action: AuditAction.UPDATE,
      targetType: "Admission",
      targetId: admissionId,
      institutionId,
      metadata: {
        action: "update_admission_status",
        from: previousStatus,
        to: newStatus,
        source: admission.source,
      },
    },
  })

  // Status-specific actions
  switch (newStatus) {
    case AdmissionStatus.INTERVIEW_SCHEDULED:
      // Send interview invitation
      await createNotification({
        recipientId: "",
        institutionId,
        channel: NotificationChannel.EMAIL,
        subject: "Interview Invitation - All Saints Mushililie Academy",
        body: `Your child ${admission.applicantFirstName} has been scheduled for an interview. Date: ${notes}.`,
        templateId: "interview_invite",
        priority: 1,
      })
      break

    case AdmissionStatus.ASSESSED:
      // Send assessment results
      await createNotification({
        recipientId: "",
        institutionId,
        channel: NotificationChannel.EMAIL,
        subject: "Assessment Results - All Saints Mushililie Academy",
        body: `Assessment completed for ${admission.applicantFirstName}. ${notes || "Results will be communicated shortly."}`,
        templateId: "assessment_results",
        priority: 1,
      })
      break

    case AdmissionStatus.OFFER_EXTENDED:
      // Send offer letter
      await createNotification({
        recipientId: "",
        institutionId,
        channel: NotificationChannel.EMAIL,
        subject: "Admission Offer - All Saints Mushililie Academy",
        body: `Dear parent, an admission offer has been extended for ${admission.applicantFirstName}. Please confirm acceptance within 14 days.`,
        templateId: "offer_letter",
        priority: 2,
      })
      break

    case AdmissionStatus.ENROLLED:
      // Send welcome email
      await createNotification({
        recipientId: "",
        institutionId,
        channel: NotificationChannel.EMAIL,
        subject: "Welcome to All Saints Mushililie Academy",
        body: `Congratulations! ${admission.applicantFirstName} ${admission.applicantLastName || ""} has been enrolled.`,
        templateId: "welcome_student",
        priority: 2,
      })
      break

    case AdmissionStatus.WITHDRAWN:
      // Send withdrawal confirmation
      await createNotification({
        recipientId: "",
        institutionId,
        channel: NotificationChannel.EMAIL,
        subject: "Withdrawal Confirmation - All Saints Mushililie Academy",
        body: `Withdrawal has been processed for ${admission.applicantFirstName}.`,
        templateId: "withdrawal_confirmation",
        priority: 0,
      })
      break
  }

  return updated
}

/**
 * Get admissions with filtering and workflow status
 */
export async function getAdmissions({
  institutionId,
  filters = {},
  pagination = { page: 1, limit: 20 },
}: {
  institutionId: string
  filters?: { status?: AdmissionSource; grade?: GradeLevel; dateRange?: { from: Date; to: Date } }
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const where: any = {
    institutionId,
    ...(filters.status && { admissionStatus: filters.status }),
    ...(filters.grade && { gradeApplyingFor: filters.grade }),
  }

  const [admissions, total] = await prisma.$transaction([
    prisma.admission.findMany({
      where,
      include: {
        student: {
          include: { grade: true },
        },
        institution: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.admission.count({ where }),
  ])

  return {
    admissions,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { AdmissionStatus, GradeLevel }