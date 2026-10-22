// Admissions API Route Handler - SaintsHub School SIS

import { withAuth, requirePermission } from "@/server/authorization"
import { createAdmissionInquiry, updateAdmissionStatus, getAdmissions } from "@/server/services/school/admissions/admission.service"
import { getInstitutionGuardians, createGuardian, linkGuardianToStudent, getStudentGuardians } from "@/server/services/school/guardians/guardian.service"
import { createEnrolment, getStudentCurrentEnrolment, getStudentEnrolmentHistory } from "@/server/services/school/enrolments/enrolment.service"
import { markAttendance, getAttendanceRecords, getStudentAttendanceHistory, getClassAttendanceSummary } from "@/server/services/school/attendance/attendance.service"
import { NextResponse } from "next/http"

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
      pagination: { page: parseInt(searchParams.get("page") || "1"), limit: parseInt(searchParams.get("limit") || "20") },
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
// GUARDIANS API (for admissions context)
// ============================================================================

export async function GETguardians(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const relationship = searchParams.get("relationship")

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

// ============================================================================
// ENROLMENTS API
// ============================================================================

export async function GETenrolments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")
    const gradeId = searchParams.get("gradeId")
    const termId = searchParams.get("termId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:enrolments:read",
      async () => { },
      { anyOf: ["school:enrolments:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getStudentEnrolmentHistory({
        studentId,
        institutionId: institutionId as string,
      })
      return NextResponse.json(result)
    }

    const result = await getEnrolments({
      institutionId: institutionId as string,
      filters: gradeId || termId ? { gradeId, termId } : undefined,
      pagination: { page: parseInt(searchParams.get("page") || "1"), limit: parseInt(searchParams.get("limit") || "20") },
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
      pagination: { page: parseInt(searchParams.get("page") || "1"), limit: parseInt(searchParams.get("limit") || "50") },
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
// EXPORT
// ============================================================================