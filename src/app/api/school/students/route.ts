// Students API Route Handler - SaintsHub School SIS
// Provides: CRUD operations, search, filtering, pagination
// All routes enforce RBAC and institution scoping via middleware

import { withAuth, requirePermission } from "@/server/authorization"
import { getStudents, getStudentById, createStudent, updateStudent, softDeleteStudent } from "@/server/services/school/students/student.service"
import { createAdmissionInquiry, updateAdmissionStatus, getAdmissions } from "@/server/services/school/admissions/admission.service"
import { getInstitutionGuardians, getGuardianById, createGuardian, updateGuardian, removeStudentGuardianLinkage, getStudentGuardians } from "@/server/services/school/guardians/guardian.service"
import { createEnrolment, transferEnrolment, getStudentCurrentEnrolment, getStudentEnrolmentHistory } from "@/server/services/school/enrolments/enrolment.service"
import { createAssessment, recordAssessmentScore, getStudentAssessmentScores, getClassAssessmentScores, getClassPerformanceSummary } from "@/server/services/school/assessments/assessment.service"
import { generateReportCard, getReportCardWithAcknowledgment, acknowledgeReportCard } from "@/server/services/school/report-cards/report-card.service"
import { markAttendance, getAttendanceRecords, getStudentAttendanceHistory, getClassAttendanceSummary } from "@/server/services/school/attendance/attendance.service"
import { createPromotionRule, getPromotionRules, processPromotion, getPromotionEligibility } from "@/server/services/school/promotions/promotion.service"
import { parseCurrency, formatCurrency } from "@/lib/config"
import { NextResponse } from "next/server"

// ============================================================================
// STUDENTS API
// ============================================================================

export async function GET(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const gradeId = searchParams.get("gradeId") || ""

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:students:read",
      async () => { },
      { anyOf: ["school:students:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getStudents({
      institutionId: institutionId as string,
      wing: "SCHOOL",
      filters: status ? { status } : undefined,
      pagination: { page, limit },
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Students API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:students:write",
      async () => { },
      { anyOf: ["school:students:write"] }
    )

    if (permissionCheck) return permissionCheck

    const student = await createStudent({
      data: body.studentData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: student,
      message: "Student created successfully",
    })
  } catch (error: any) {
    console.error("Create student API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 400 }
    )
  }
}

// ============================================================================
// STUDENT DETAILS
// ============================================================================

export async function GETsingle(request: Request, { params }: { params: { institution: string; id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const id = params.id

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:students:read",
      async () => { },
      { anyOf: ["school:students:read"] }
    )

    if (permissionCheck) return permissionCheck

    const student = await getStudentById({
      studentId: id,
      institutionId: institutionId as string,
    })

    return NextResponse.json({ success: true, data: student })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Student not found" },
      { status: 404 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { institution: string; id: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const id = params.id
    const updatedBy = body.updatedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:students:write",
      async () => { },
      { anyOf: ["school:students:write"] }
    )

    if (permissionCheck) return permissionCheck

    const student = await updateStudent({
      studentId: id,
      institutionId: institutionId as string,
      data: body.studentData,
      updatedById: updatedBy,
    })

    return NextResponse.json({
      success: true,
      data: student,
      message: "Student updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { institution: string; id: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const id = params.id
    const deletedBy = body.deletedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:students:delete",
      async () => { },
      { anyOf: ["school:students:delete"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await softDeleteStudent({
      studentId: id,
      institutionId: institutionId as string,
      deletedById: deletedBy,
      reason: body.reason || "Withdrawn/Transferred",
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Student soft-deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete student" },
      { status: 400 }
    )
  }
}

// ============================================================================
// ADMISSIONS API
// ============================================================================

export async function GETadmissions(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const status = searchParams.get("status") as any

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:admissions:read",
      async () => { },
      { anyOf: ["school:admissions:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getAdmissions({
      institutionId: institutionId as string,
      filters: status ? { status } : undefined,
      pagination: { page: 1, limit: 20 },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch admissions" },
      { status: 500 }
    )
  }
}

export async function POSTadmissions(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:admissions:write",
      async () => { },
      { anyOf: ["school:admissions:write"] }
    )

    if (permissionCheck) return permissionCheck

    const admission = await createAdmissionInquiry({
      data: body.admissionData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: admission,
      message: "Admission inquiry created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create admission" },
      { status: 400 }
    )
  }
}

export async function PUTadmissions(request: Request, { params }: { params: { institution: string; id: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const id = params.id
    const updatedBy = body.updatedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:admissions:write",
      async () => { },
      { anyOf: ["school:admissions:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await updateAdmissionStatus({
      admissionId: id,
      institutionId: institutionId as string,
      newStatus: body.newStatus,
      updatedById: updatedBy,
      notes: body.notes,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Admission status updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update admission status" },
      { status: 400 }
    )
  }
}

// ============================================================================
// GUARDIANS API
// ============================================================================

export async function GETguardians(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const relationship = searchParams.get("relationship")
    const isPrimary = searchParams.get("isPrimary")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:guardians:read",
      async () => { },
      { anyOf: ["school:guardians:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getInstitutionGuardians({
      institutionId: institutionId as string,
      filters: relationship ? { relationship } : undefined,
      pagination: { page: 1, limit: 20 },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch guardians" },
      { status: 500 }
    )
  }
}

export async function POSTguardians(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:guardians:write",
      async () => { },
      { anyOf: ["school:guardians:write"] }
    )

    if (permissionCheck) return permissionCheck

    const guardian = await createGuardian({
      data: body.guardianData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: guardian,
      message: "Guardian created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create guardian" },
      { status: 400 }
    )
  }
}

export async function PUTguardians(request: Request, { params }: { params: { institution: string; id: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const id = params.id
    const updatedBy = body.updatedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:guardians:write",
      async () => { },
      { anyOf: ["school:guardians:write"] }
    )

    if (permissionCheck) return permissionCheck

    const guardian = await updateGuardian({
      guardianId: id,
      institutionId: institutionId as string,
      data: body.guardianData,
      updatedById: updatedBy,
    })

    return NextResponse.json({
      success: true,
      data: guardian,
      message: "Guardian updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update guardian" },
      { status: 400 }
    )
  }
}

// ============================================================================
// STUDENT-GUARDIAN LINKAGE API
// ============================================================================

export async function POSTstudentGuardianLink(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:guardians:write",
      async () => { },
      { anyOf: ["school:guardians:write"] }
    )

    if (permissionCheck) return permissionCheck

    const linkage = await linkGuardianToStudent({
      studentId: body.studentId,
      guardianId: body.guardianId,
      institutionId: institutionId as string,
      createdById: createdBy,
      isPrimary: body.isPrimary,
      primaryPayer: body.primaryPayer,
      canPickUp: body.canPickUp,
      canCollectReports: body.canCollectReports,
      canAuthorizeAbsence: body.canAuthorizeAbsence,
    })

    return NextResponse.json({
      success: true,
      data: linkage,
      message: "Guardian-linked successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to link guardian" },
      { status: 400 }
    )
  }
}

// ============================================================================
// ENROLMENTS API
// ============================================================================

export async function GETenrolments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const gradeId = searchParams.get("gradeId")
    const termId = searchParams.get("termId")
    const studentId = searchParams.get("studentId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:enrolments:read",
      async () => { },
      { anyOf: ["school:enrolments:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getEnrolments({
      institutionId: institutionId as string,
      filters: gradeId || termId ? { gradeId: gradeId, termId } : undefined,
      pagination: { page: 1, limit: 20 },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch enrolments" },
      { status: 500 }
    )
  }
}

export async function POSTenrolments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:enrolments:write",
      async () => { },
      { anyOf: ["school:enrolments:write"] }
    )

    if (permissionCheck) return permissionCheck

    const enrolment = await createEnrolment({
      data: body.enrolmentData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: enrolment,
      message: "Enrolment created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create enrolment" },
      { status: 400 }
    )
  }
}

// ============================================================================
// ASSESSMENTS API
// ============================================================================

export async function GETassessments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const gradeId = searchParams.get("gradeId")
    const termId = searchParams.get("termId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:assessments:read",
      async () => { },
      { anyOf: ["school:assessments:read"] }
    )

    if (permissionCheck) return permissionCheck

    // For now, return all assessments for the institution
    // In production, filter by grade/term
    const assessments = await prisma.assessment.findMany({
      where: { institutionId },
      include: { grade: true, term: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: assessments })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}

export async function POSTassessments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:assessments:write",
      async () => { },
      { anyOf: ["school:assessments:write"] }
    )

    if (permissionCheck) return permissionCheck

    const assessment = await createAssessment({
      data: body.assessmentData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: assessment,
      message: "Assessment created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create assessment" },
      { status: 400 }
    )
  }
}

// ============================================================================
// REPORT CARDS API
// ============================================================================

export async function GETreport-cards(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:report-cards:read",
      async () => { },
      { anyOf: ["school:report-cards:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getReportCardWithAcknowledgment({
        studentId,
        institutionId: institutionId as string,
      })
      return NextResponse.json(result)
    }

    const reportCards = await prisma.reportCard.findMany({
      where: { institutionId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
        term: true,
        grade: true,
      },
      orderBy: { issuedAt: "desc" },
    })

    return NextResponse.json({ success: true, data: reportCards })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch report cards" },
      { status: 500 }
    )
  }
}

export async function POSTreport-cards(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const issuedBy = body.issuedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:report-cards:write",
      async () => { },
      { anyOf: ["school:report-cards:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await issueReportCard({
      studentId: body.studentId,
      institutionId: institutionId as string,
      termId: body.termId,
      issuedById: issuedBy,
      distribute: body.distribute !== false,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to issue report card" },
      { status: 400 }
    )
  }
}

// ============================================================================
// ATTENDANCE API
// ============================================================================

export async function GETattendance(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:attendance:read",
      async () => { },
      { anyOf: ["school:attendance:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getStudentAttendanceHistory({
        studentId,
        institutionId: institutionId as string,
      })
      return NextResponse.json(result)
    }

    const result = await getAttendanceRecords({
      institutionId: institutionId as string,
      pagination: { page: 1, limit: 50 },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}

export async function POSTattendance(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const markedBy = body.markedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:attendance:write",
      async () => { },
      { anyOf: ["school:attendance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await markAttendance({
      studentId: body.studentId,
      institutionId: institutionId as string,
      date: body.date,
      status: body.status,
      markedById: markedBy,
      notes: body.notes,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Attendance marked successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to mark attendance" },
      { status: 400 }
    )
  }
}

// ============================================================================
// PROMOTIONS API
// ============================================================================

export async function GETpromotions(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:promotions:read",
      async () => { },
      { anyOf: ["school:promotions:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getPromotionRules({
      institutionId: institutionId as string,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    )
  }
}

export async function POSTpromotions(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:promotions:write",
      async () => { },
      { anyOf: ["school:promotions:write"] }
    )

    if (permissionCheck) return permissionCheck

    const promotion = await createPromotionRule({
      data: body.promotionData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: promotion,
      message: "Promotion rule created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create promotion rule" },
      { status: 400 }
    )
  }
}

// ============================================================================
// EXPORT FOR MIDDLEWARE
// ============================================================================

// Export types and services for use in other handlers
export type {
  Student,
  Guardian,
  Admission,
  Enrolment,
  Assessment,
  AssessmentScore,
  ReportCard,
  Attendance,
  Promotion,
  StudentGuardian,
  GradeLevel,
  GuardianRelationship,
  AdmissionStatus
}