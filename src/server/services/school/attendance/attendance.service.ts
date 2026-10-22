/* Attendance Service - SaintsHub School SIS
Handles: Daily attendance entry, attendance history, absence alerts
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// DAILY ATTENDANCE ENTRY
// ============================================================================

/**
 * Mark attendance for a student for a specific date
 */
export async function markAttendance({
  studentId,
  institutionId,
  date,
  status: attendanceStatus,
  markedById,
  notes,
}: {
  studentId: string
  institutionId: string
  date: Date | string
  attendanceStatus: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  markedById: string
  notes?: string
}) {
  const dateString = typeof date === "string" ? date : date.toISOString().split("T")[0]

  // Check if attendance already marked for this student/date
  const existing = await prisma.attendance.findFirst({
    where: {
      studentId,
      institutionId,
      date: dateString,
    },
  })

  let attendanceRecord: any

  if (existing) {
    // Update existing record
    attendanceRecord = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        status: attendanceStatus,
        ...(notes && { notes }),
      },
    })
  } else {
    // Create new attendance record
    attendanceRecord = await prisma.attendance.create({
      data: {
        studentId,
        institutionId,
        date: dateString,
        status: attendanceStatus,
        notes,
      },
    })
  }

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: markedById,
      action: AuditAction.CREATE,
      targetType: "Attendance",
      targetId: attendanceRecord.id,
      institutionId,
      metadata: {
        action: "mark_attendance",
        student: attendanceRecord.studentId,
        status: attendanceStatus,
        date: dateString,
      },
    },
  })

  // If absent, send SMS/Email alert to guardian
  if (attendanceStatus === "ABSENT") {
    const student = await prisma.student.findUnique({
      where: { id: studentId, institutionId },
      include: {
        guardians: {
          include: {
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
          where: { isPrimary: true },
        },
      },
    })

    if (student) {
      for (const sg of student.guardians) {
        if (sg.user?.id && sg.user?.phone) {
          await createNotification({
            recipientId: sg.user.id,
            institutionId,
            channel: NotificationChannel.SMS,
            subject: "Attendance Alert - All Saints Mushililie Academy",
            body: `Attendance Alert: ${student.firstName} ${student.lastName} was ABSENT on ${dateString}. Please contact the school if this was unexpected.`,
            templateId: "absence_alert",
            priority: 2,
          })
        }

        if (sg.user?.id) {
          await createNotification({
            recipientId: sg.user.id,
            institutionId,
            channel: NotificationChannel.EMAIL,
            subject: "Attendance Alert - All Saints Mushililie Academy",
            body: `Attendance Alert: ${student.firstName} ${student.lastName} was absent on ${dateString}.`,
            templateId: "absence_alert_email",
            priority: 2,
          })
        }
      }
    }
  }

  return attendanceRecord
}

/**
 * Get attendance records with filtering
 */
export async function getAttendanceRecords({
  institutionId,
  filters = {},
  pagination = { page: 1, limit: 50 },
}: {
  institutionId: string
  filters?: { studentId?: string; gradeId?: string; startDate?: Date; endDate?: Date; status?: string }
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const where: any = {
    institutionId,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status }),
    ...(filters.startDate && {
      date: { gte: filters.startDate },
    }),
    ...(filters.endDate && {
      date: { lte: filters.endDate },
    }),
  }

  const [records, total] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            grade: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where }),
  ])

  return {
    records,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Get student attendance history
 */
export async function getStudentAttendanceHistory({
  studentId,
  institutionId,
  filters = {},
}: {
  studentId: string
  institutionId: string
  filters?: { startDate?: Date; endDate?: Date }
}) {
  const where: any = {
    studentId,
    institutionId,
    ...(filters.startDate && { date: { gte: filters.startDate } }),
    ...(filters.endDate && { date: { lte: filters.endDate } }),
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, admissionNumber: true },
      },
    },
    orderBy: { date: "desc" },
  })

  // Calculate summary
  const totalDays = records.length
  const presentDays = records.filter((r) => r.status === "PRESENT").length
  const absentDays = records.filter((r) => r.status === "ABSENT").length
  const lateDays = records.filter((r) => r.status === "LATE").length
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "0.00"

  return {
    records,
    summary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage: Number(attendancePercentage),
    },
  }
}

/**
 * Get class attendance summary
 */
export async function getClassAttendanceSummary({
  institutionId,
  gradeId,
  termId,
}: {
  institutionId: string
  gradeId: string
  termId: string
}) {
  // Get all students in grade
  const students = await prisma.student.findMany({
    where: { gradeId, institutionId },
    include: { user: { select: { id: true, name: true } } },
  })

  // Get all enrolments for the grade and term
  const enrolments = await prisma.enrolment.findMany({
    where: {
      institutionId,
      gradeId,
      termId,
      status: "ACTIVE",
    },
    include: { student: true },
  })

  // Get attendance records for the term
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      institutionId,
      student: { some: { enrolment: { termId } } },
    },
  })

  // Calculate per-student attendance
  const studentAttendance = students.map((student) => {
    const studentRecords = attendanceRecords.filter(
      (r) => r.studentId === student.id
    )

    const total = studentRecords.length
    const present = studentRecords.filter((r) => r.status === "PRESENT").length
    const absent = studentRecords.filter((r) => r.status === "ABSENT").length
    const late = studentRecords.filter((r) => r.status === "LATE").length
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : "0.00"

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName || ""}`,
      admissionNumber: student.admissionNumber,
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      attendancePercentage: Number(percentage),
    }
  })

  // Calculate class summary
  const totalRecords = attendanceRecords.length
  const totalPresent = attendanceRecords.filter((r) => r.status === "PRESENT").length
  const totalAbsent = attendanceRecords.filter((r) => r.status === "ABSENT").length
  const totalLate = attendanceRecords.filter((r) => r.status === "LATE").length
  const classAttendancePercentage = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(2) : "0.00"

  return {
    classAttendancePercentage: Number(classAttendancePercentage),
    totalRecords,
    totalPresent,
    totalAbsent,
    totalLate,
    studentAttendance,
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

// Export attendance-related types if needed