/* Guardian Service - SaintsHub School SIS
Handles: Guardian CRUD, student-guardian linkages, relationship management
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, normalizePhone } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// GUARDIAN CRUD
// ============================================================================

/**
 * Get all guardians for an institution
 */
export async function getInstitutionGuardians({
  institutionId,
  filters = {},
  pagination = { page: 1, limit: 20 },
}: {
  institutionId: string
  filters?: { relationship?: string; isPrimary?: boolean; verified?: boolean }
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const where: any = {
    institutionId,
    ...(filters.relationship && { relationship: filters.relationship }),
    ...(filters.isPrimary !== undefined && { isPrimary: filters.isPrimary }),
  }

  const [guardians, total] = await prisma.$transaction([
    prisma.guardian.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        studentGuardians: {
          include: {
            student: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { lastName: "asc" },
    }),
    prisma.guardian.count({ where }),
  ])

  return {
    guardians,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Get guardian by ID with full details
 */
export async function getGuardianById({
  guardianId,
  institutionId,
}: {
  guardianId: string
  institutionId: string
}) {
  const guardian = await prisma.guardian.findUnique({
    where: { id: guardianId, institutionId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      studentGuardians: {
        include: {
          student: {
            include: {
              grade: true,
              stream: true,
            },
          },
        },
      },
    })

    if (!guardian) {
      throw new Error("Guardian not found or not accessible in this institution")
    }

  return guardian
}

// ============================================================================
// STUDENT-GUARDIAN LINKAGE
// ============================================================================

/**
 * Create/update student-guardian relationship
 */
export async function upsertStudentGuardianLinkage({
  studentId,
  guardianId,
  institutionId,
  data,
  createdById,
}: {
  studentId: string
  guardianId: string
  institutionId: string
  data: {
    isPrimary: boolean
    primaryPayer: boolean
    canPickUp: boolean
    canCollectReports: boolean
    canAuthorizeAbsence: boolean
  }
  createdById: string
}) {
  // Check if linkage exists
  const existing = await prisma.studentGuardian.findFirst({
    where: {
      studentId,
      guardianId,
      institutionId,
    },
  })

  if (existing) {
    // Update existing
    const updated = await prisma.studentGuardian.update({
      where: { id: existing.id },
      data,
    })

    // Audit log
    await prisma.auditEvent.create({
      data: {
        actorId: createdById,
        action: AuditAction.UPDATE,
        targetType: "StudentGuardian",
        targetId: updated.id,
        institutionId,
        metadata: {
          action: "update_student_guardian_linkage",
          isPrimary: data.isPrimary,
        },
      },
    })

    return updated
  }

  // Create new linkage
  const linkage = await prisma.studentGuardian.create({
    data: {
      studentId,
      guardianId,
      institutionId,
      ...data,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "StudentGuardian",
      targetId: linkage.id,
      institutionId,
      metadata: {
        action: "create_student_guardian_linkage",
        isPrimary: data.isPrimary,
      },
    },
  })

  return linkage
}

/**
 * Remove student-guardian linkage
 */
export async function removeStudentGuardianLinkage({
  studentId,
  guardianId,
  institutionId,
  deletedById,
}: {
  studentId: string
  guardianId: string
  institutionId: string
  deletedById: string
}) {
  const linkage = await prisma.studentGuardian.findFirst({
    where: { studentId, guardianId, institutionId },
  })

  if (!linkage) {
    throw new Error("No guardian-linkage found for this student")
  }

  await prisma.studentGuardian.delete({
    where: { id: linkage.id },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: deletedById,
      action: AuditAction.DELETE,
      targetType: "StudentGuardian",
      targetId: linkage.id,
      institutionId,
      metadata: {
        action: "remove_student_guardian_linkage",
      },
    },
  })

  return linkage
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { Guardian, StudentGuardian, GuardianRelationship }