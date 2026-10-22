/* Student Service - SaintsHub School SIS
Handles: Student CRUD, admissions workflow, guardian management, enrolments, promotions
*/
import { prisma } from "../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, parseCurrency, hasRole, requirePermission } from "@/lib/config"
import { createNotification, markNotificationSent } from "./notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// STUDENT CRUD & SEARCH
// ============================================================================

/**
 * Get students with filtering and pagination
 */
export async function getStudents({
  institutionId,
  wing,
  filters = {},
  pagination = { page: 1, limit: 20 },
  search = "",
}: {
  institutionId: string
  wing: "SCHOOL" | "PARISH" | "SHARED"
  filters?: { status?: string; gradeId?: string; streamId?: string; gender?: string }
  pagination: { page: number; limit: number }
  search?: string
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {
    institutionId,
    ...(filters.status && { status: filters.status }),
    ...(filters.gradeId && { gradeId: filters.gradeId }),
    ...(filters.gender && { gender: filters.gender }),
  }

  // Search across name fields
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { preferredName: { contains: search, mode: "insensitive" } },
      { admissionNumber: { contains: search, mode: "insensitive" } },
    ]
  }

  const [students, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: {
        grade: true,
        stream: true,
        enrolments: {
          include: { term: true },
        },
        guardians: {
          include: { guardian: true },
          where: { isPrimary: true },
        },
      },
      skip,
      take: limit,
      orderBy: { lastName: "asc" },
    }),
    prisma.student.count({ where }),
  ])

  return {
    students,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Get single student by ID with full details
 */
export async function getStudentById({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const student = await prisma.student.findUnique({
    where: { id: studentId, institutionId },
    include: {
      grade: true,
      stream: true,
      enrolments: {
        include: { term: true },
        orderBy: { term: { ordinal: "asc" } },
      },
      guardians: {
        include: {
          guardian: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
        },
      },
      admissions: {
        orderBy: { createdAt: "desc" },
      },
    })

    if (!student) {
      throw new Error("Student not found or not accessible in this institution")
    }

  return student
}

/**
 * Create a new student
 */
export async function createStudent({
  data,
  institutionId,
  createdById,
}: {
  data: {
    firstName: string
    lastName?: string
    otherNames?: string
    preferredName?: string
    dateOfBirth: Date
    gender: "Male" | "Female" | "Intersex"
    county?: string
    subCounty?: string
    location?: string
    religion?: string
    nationality?: string
    tribe?: string
    passportNumber?: string
    birthCertificate?: string
    photoUrl?: string
    status?: StudentStatus
    gradeId?: string
    streamId?: string
    admissionDate: Date
    nemisNumber?: string
    dietaryRestrictions?: string
    allergies?: string
    specialNeeds?: boolean
    snECategory?: string
    previousSchool?: string
    parentOccupation?: string
    sponsorOrganization?: string
    sponsorContact?: string
    transportProvided?: boolean
    boarding?: boolean
    parentConsent?: boolean
  },
  institutionId: string
  createdById: string
}) {
  // Validate grade exists and belongs to institution
  if (data.gradeId) {
    const grade = await prisma.grade.findUnique({
      where: { id: data.gradeId, institutionId },
    })
    if (!grade) {
      throw new Error("Invalid grade for this institution")
    }
  }

  // Validate stream exists if provided
  if (data.streamId) {
    const stream = await prisma.streamEntry.findUnique({
      where: { id: data.streamId, institutionId },
    })
    if (!stream) {
      throw new Error("Invalid stream for this institution")
    }
  }

  const student = await prisma.student.create({
    data: {
      ...data,
      institutionId,
      admissionNumber: `ADM-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`,
      status: data.status || StudentStatus.ACTIVE,
    },
    include: {
      grade: true,
      stream: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Student",
      targetId: student.id,
      institutionId,
      metadata: {
        action: "create_student",
        admissionNumber: student.admissionNumber,
      },
    },
  })

  // Create background job for notifications
  await createBackgroundJob({
    type: JobType.SEND_EMAIL,
    payload: {
      type: "new_student_welcome",
      institutionId,
      studentId: student.id,
    },
    institutionId,
    correlationId: `student_${student.id}`,
  })

  return student
}

/**
 * Update student information
 */
export async function updateStudent({
  studentId,
  institutionId,
  data,
  updatedById,
}: {
  studentId: string
  institutionId: string
  data: Partial<{
    firstName: string
    lastName?: string
    otherNames?: string
    preferredName?: string
    dateOfBirth: Date
    gender: "Male" | "Female" | "Intersex"
    county?: string
    subCounty?: string
    location?: string
    religion?: string
    nationality?: string
    tribe?: string
    passportNumber?: string
    birthCertificate?: string
    photoUrl?: string
    status?: StudentStatus
    gradeId?: string
    streamId?: string
    dietaryRestrictions?: string
    allergies?: string
    specialNeeds?: boolean
    snECategory?: string
    previousSchool?: string
    parentOccupation?: string
    sponsorOrganization?: string
    sponsorContact?: string
    transportProvided?: boolean
    boarding?: boolean
    parentConsent?: boolean
  }>,
  updatedById: string
}) {
  // Validate grade if being updated
  if (data.gradeId) {
    const grade = await prisma.grade.findUnique({
      where: { id: data.gradeId, institutionId },
    })
    if (!grade) {
      throw new Error("Invalid grade for this institution")
    }
  }

  // Validate stream if being updated
  if (data.streamId) {
    const stream = await prisma.streamEntry.findUnique({
      where: { id: data.streamId, institutionId },
    })
    if (!stream) {
      throw new Error("Invalid stream for this institution")
    }
  }

  const student = await prisma.student.update({
    where: { id: studentId, institutionId },
    data,
    include: {
      grade: true,
      stream: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: updatedById,
      action: AuditAction.UPDATE,
      targetType: "Student",
      targetId: studentId,
      institutionId,
      metadata: {
        action: "update_student",
        updatedFields: Object.keys(data),
      },
    },
  })

  return student
}

/**
 * Soft delete student (mark as withdrawn/graduated)
 */
export async function softDeleteStudent({
  studentId,
  institutionId,
  deletedById,
  reason: deletionReason,
}: {
  studentId: string
  institutionId: string
  deletedById: string
  reason: string
}) {
  const student = await prisma.student.update({
    where: { id: studentId, institutionId },
    data: {
      status: StudentStatus.WITHDRAWN,
      deletedAt: new Date(),
      // Store leaving reason in metadata
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: deletedById,
      action: AuditAction.DELETE,
      targetType: "Student",
      targetId: studentId,
      institutionId,
      metadata: {
        action: "soft_delete_student",
        reason: deletionReason,
      },
    },
  })

  // Create background job for leaving certificate
  await createBackgroundJob({
    type: JobType.SEND_EMAIL,
    payload: {
      type: "leaving_certificate",
      institutionId,
      studentId,
    },
    institutionId,
    correlationId: `withdrawal_${studentId}`,
  })

  return student
}

// ============================================================================
// ADMISSIONS WORKFLOW
// ============================================================================

/**
 * Create new admission inquiry
 */
export async function createAdmission({
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
    applicantStatus?: string
  },
  institutionId: string
  createdById: string
}) {
  const admission = await prisma.admission.create({
    data: {
      ...data,
      institutionId,
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
        action: "create_admission",
        source: data.source,
        grade: data.gradeApplyingFor,
      },
    },
  })

  return admission
}

/**
 * Update admission status through workflow
 */
export async function updateAdmissionStatus({
  admissionId,
  institutionId,
  newStatus: nextStatus,
  updatedById,
  notes,
}: {
  admissionId: string
  institutionId: string
  newStatus: AdmissionStatus
  updatedById: string
  notes?: string
}) {
  const admission = await prisma.admission.update({
    where: { id: admissionId, institutionId },
    data: {
      admissionStatus: nextStatus,
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
        from: admission.admissionStatus,
        to: nextStatus,
      },
    },
  })

  // If offer extended, create notification to parent
  if (nextStatus === AdmissionStatus.OFFER_EXTENDED) {
    await createNotification({
      recipientId: admission.createdById || "",
      institutionId,
      channel: NotificationChannel.EMAIL,
      subject: "Admission Offer - All Saints Mushililie Academy",
      body: `Dear parent, an admission offer has been extended for ${admission.applicantFirstName}. Please confirm acceptance within 14 days.`,
      templateId: "admission_confirmation",
      priority: 1,
    })
  }

  return admission
}

/**
 * Process student enrolment from accepted admission
 */
export async function enrolStudent({
  admissionId,
  institutionId,
  enrolledById,
  gradeLevel: targetGradeLevel,
}: {
  admissionId: string
  institutionId: string
  enrolledById: string
  targetGradeLevel: GradeLevel
}) {
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId, institutionId },
    include: {
      student: true,
    },
  })

  if (!admission || admission.admissionStatus !== AdmissionStatus.OFFER_EXTENDED) {
    throw new Error("Admission not in offer-extended status")
  }

  const student = admission.student

  // Create enrolment
  const term = await prisma.term.findFirst({
    where: { institutionId, isCurrent: true },
  })

  if (!term) {
    throw new Error("No current term found")
  }

  const enrolment = await prisma.enrolment.create({
    data: {
      institutionId,
      studentId: student.id,
      gradeId: student.gradeId,
      termId: term.id,
      admissionId,
      status: "ACTIVE",
    },
    include: {
      student: true,
      grade: true,
      term: true,
    },
  })

  // Update admission status
  await prisma.admission.update({
    where: { id: admissionId, institutionId },
    data: {
      admissionStatus: AdmissionStatus.ENROLLED,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: enrolledById,
      action: AuditAction.CREATE,
      targetType: "Enrolment",
      targetId: enrolment.id,
      institutionId,
      metadata: {
        action: "enrol_student",
        from_admission: admissionId,
        grade: targetGradeLevel,
      },
    },
  })

  // Notify guardian
  await createNotification({
    recipientId: "",
    institutionId,
    channel: NotificationChannel.EMAIL,
    subject: "Student Enrolled - All Saints Mushililie Academy",
    body: `Congratulations! ${student.firstName} ${student.lastName} has been enrolled in ${student.grade?.name}. Term starts ${term.startDate.toLocaleDateString("en-KE")}.`,
    templateId: "welcome_student",
    priority: 1,
  })

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

// ============================================================================
// GUARDIAN MANAGEMENT
// ============================================================================

/**
 * Create guardian
 */
export async function createGuardian({
  data,
  institutionId,
  createdById,
}: {
  data: {
    firstName: string
    lastName?: string
    otherNames?: string
    relationship: GuardianRelationship
    phone: string
    idNumber?: string
    occupation?: string
    employer?: string
    primaryPayer?: boolean
    pickupAuthorised?: boolean
    email?: string
  },
  institutionId: string
  createdById: string
}) {
  // Normalize phone
  const normalizedPhone = normalizePhone(data.phone)

  const guardian = await prisma.guardian.create({
    data: {
      ...data,
      institutionId,
      phone: normalizedPhone,
      idNumberVerified: false, // Will be verified later
    },
    include: {
      user: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Guardian",
      targetId: guardian.id,
      institutionId,
      metadata: {
        action: "create_guardian",
        relationship: data.relationship,
        phone: normalizedPhone,
      },
    },
  })

  return guardian
}

/**
 * Update guardian information
 */
export async function updateGuardian({
  guardianId,
  institutionId,
  data,
  updatedById,
}: {
  guardianId: string
  institutionId: string
  data: Partial<{
    firstName: string
    lastName?: string
    otherNames?: string
    relationship: GuardianRelationship
    phone?: string
    idNumber?: string
    occupation?: string
    employer?: string
    primaryPayer?: boolean
    pickupAuthorised?: boolean
    email?: string
  }>,
  updatedById: string
}) {
  // Normalize phone if being updated
  let normalizedPhone = data.phone
  if (normalizedPhone) {
    normalizedPhone = normalizePhone(normalizedPhone)
  }

  const guardian = await prisma.guardian.update({
    where: { id: guardianId, institutionId },
    data: {
      ...data,
      phone: normalizedPhone,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: updatedById,
      action: AuditAction.UPDATE,
      targetType: "Guardian",
      targetId: guardianId,
      institutionId,
      metadata: {
        action: "update_guardian",
        updatedFields: Object.keys(data),
      },
    },
  })

  return guardian
}

/**
 * Link guardian to student
 */
export async function linkGuardianToStudent({
  studentId,
  guardianId,
  institutionId,
  createdById,
  isPrimary,
  primaryPayer,
  canPickUp,
  canCollectReports,
  canAuthorizeAbsence,
}: {
  studentId: string
  guardianId: string
  institutionId: string
  createdById: string
  isPrimary: boolean
  primaryPayer: boolean
  canPickUp: boolean
  canCollectReports: boolean
  canAuthorizeAbsence: boolean
}) {
  // Check if linkage already exists
  const existing = await prisma.studentGuardian.findFirst({
    where: {
      studentId,
      guardianId,
      institutionId,
    },
  })

  if (existing) {
    // Update existing linkage
    const updated = await prisma.studentGuardian.update({
      where: { id: existing.id },
      data: {
        isPrimary,
        primaryPayer,
        canPickUp,
        canCollectReports,
        canAuthorizeAbsence,
      },
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
      isPrimary,
      primaryPayer,
      canPickUp,
      canCollectReports,
      canAuthorizeAbsence,
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
        isPrimary,
        primaryPayer,
      },
    },
  })

  return linkage
}

/**
 * Get guardians for a student
 */
export async function getStudentGuardians({
  studentId,
  institutionId,
}: {
  studentId: string
  institutionId: string
}) {
  const guardians = await prisma.studentGuardian.findMany({
    where: { studentId, institutionId },
    include: {
      guardian: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      },
      orderBy: { isPrimary: "desc" },
    },
  })

  return guardians
}

// ============================================================================
// ENROLMENTS
// ============================================================================

/**
 * Get enrolments with filtering
 */
export async function getEnrolments({
  institutionId,
  filters = {},
  pagination = { page: 1, limit: 20 },
}: {
  institutionId: string
  filters?: { gradeId?: string; termId?: string; status?: string }
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const where: any = {
    institutionId,
    ...(filters.gradeId && { gradeId: filters.gradeId }),
    ...(filters.termId && { termId: filters.termId }),
    ...(filters.status && { status: filters.status }),
  }

  const [enrolments, total] = await prisma.$transaction([
    prisma.enrolment.findMany({
      where,
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
      skip,
      take: limit,
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.enrolment.count({ where }),
  ])

  return {
    enrolments,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Promote students to next grade
 */
export async function promoteStudents({
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
      promotedStudents: true,
    },
  })

  if (!promotion || promotion.status !== "PENDING") {
    throw new Error("Promotion not in pending status")
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

        // Create new enrolment for next grade/term
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
      ...(results.length > 0 && { notes: `${results.length} students promoted successfully` }),
    }),
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
        action: "promote_students",
        total: promotion.promotedStudents.length,
        completed: results.length,
      },
    },
  })

  // Notify affected guardians
  const promotedStudents = await prisma.student.findMany({
    where: { institutionId, enrolments: { some: { gradeId: promotion.gradeTo } } },
    include: { guardians: { include: { guardian: true, user: true } } },
  })

  for (const student of promotedStudents) {
    for (const sg of student.guardians) {
      if (sg.guardian.user?.id) {
        await createNotification({
          recipientId: sg.guardian.user.id,
          institutionId,
          channel: NotificationChannel.EMAIL,
          subject: "Student Promotion - All Saints Mushililie Academy",
          body: `Your child ${student.firstName} ${student.lastName} has been promoted to ${student.grade?.name}. New term begins ${new Date().toLocaleDateString("en-KE")}.`,
          templateId: "promotion_notice",
          priority: 0,
        })
      }
    }
  }

  return results
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize Kenyan phone number to +254 format
 */
function normalizePhone(phone: string): string {
  let normalized = phone.trim()
  normalized = normalized.replace(/^\+?254?/, "")
  normalized = normalized.replace(/^0/, "")
  return `+254${normalized}`
}

// Export types for use in route handlers
export type { Student, Guardian, Admission, Enrolment, StudentGuardian, GradeLevel, GuardianRelationship }
export type { AdmissionStatus }