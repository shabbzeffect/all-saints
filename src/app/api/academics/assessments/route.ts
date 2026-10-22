// Academics API Route Handler - SaintsHub School Academics
// Provides: Assessment creation, scoring, report cards, timetables, lesson plans, discipline, clubs, KPSEA/KJSEA
// All routes enforce RBAC and institution scoping via middleware

import { withAuth, requirePermission } from "@/server/authorization"
import {
  createAssessment,
  recordAssessmentScore,
  getStudentAssessmentScores,
  getClassPerformanceSummary,
} from "@/server/services/academics/assessments/assessment.service"
import {
  generateReportCard,
  getReportCardWithAcknowledgment,
  acknowledgeReportCard,
  getReportCardHistory,
} from "@/server/services/academics/report-cards/report-card.service"
import {
  createTimetable,
  getTimetables,
  createTimetableLine,
} from "@/server/services/academics/timetable/timetable.service"
import {
  createLessonPlan,
  getLessonPlans,
} from "@/server/services/academics/lesson-plans/lesson-plan.service"
import {
  logDisciplineIncident,
  getDisciplineHistory,
} from "@/server/services/academics/discipline/discipline.service"
import {
  createClub,
  getClubs,
  addClubMember,
} from "@/server/services/academics/clubs/club.service"
import {
  registerKPSEA,
  registerKJSEA,
  getRegistrationStatus,
} from "@/server/services/academics/kpsea-kjsea/kpsea-kjsea.service"
import { NextResponse } from "next/http"

// ============================================================================
// ASSESSMENTS API
// ============================================================================

export async function GETassessments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const gradeId = searchParams.get("gradeId")
    const subjectId = searchParams.get("subjectId")
    const termId = searchParams.get("termId")
    const assessmentType = searchParams.get("type") as any

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:assessments:read",
      async () => { },
      { anyOf: ["school:assessments:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (gradeId || subjectId || termId) {
      // Detailed query
      const result = await getClassPerformanceSummary({
        institutionId: institutionId as string,
        gradeId: gradeId,
        assessmentId: subjectId || termId,
        termId,
      })
      return NextResponse.json(result)
    }

    // Default: list assessments for institution
    const assessments = await prisma.assessment.findMany({
      where: { institutionId },
      include {
        subject: {
          select: { id: true, name: true, code: true },
        },
        grade: true,
        term: true,
      },
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
// ASSESSMENT SCORES API
// ============================================================================

export async function POSTassessment-scores(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const scoredBy = body.scoredBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:assessments:write",
      async () => { },
      { anyOf: ["school:assessments:write"] }
    )

    if (permissionCheck) return permissionCheck

    const score = await recordAssessmentScore({
      assessmentId: body.assessmentId,
      institutionId: institutionId as string,
      studentId: body.studentId,
      score: body.score,
      assessedById: scoredBy,
      gradeBand: body.gradeBand,
    })

    return NextResponse.json({
      success: true,
      data: score,
      message: "Assessment score recorded successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record assessment score" },
      { status: 400 }
    )
  }
}

// ============================================================================
// STUDENT ASSESSMENTS API
// ============================================================================

export async function GETstudent-assessments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")
    const assessmentType = searchParams.get("type") as any

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:assessments:read",
      async () => { },
      { anyOf: ["school:assessments:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getStudentAssessmentScores({
        studentId,
        institutionId: institutionId as string,
        filters: assessmentType ? { assessmentType } : undefined,
      })
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: "Student ID required" },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student assessments" },
      { status: 500 }
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

    const reportCards = await getReportCardHistory({
      studentId: "",
      institutionId: institutionId as string,
    })

    return NextResponse.json(reportCards)
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

    const result = await generateReportCard({
      studentId: body.studentId,
      institutionId: institutionId as string,
      termId: body.termId,
      issuedById: issuedBy,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate report card" },
      { status: 400 }
    )
  }
}

// ============================================================================
// TIMETABLE API
// ============================================================================

export async function GETtimetables(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const gradeId = searchParams.get("gradeId")
    const termId = searchParams.get("termId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:timetable:read",
      async () => { },
      { anyOf: ["school:timetable:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getTimetables({
      institutionId: institutionId as string,
      gradeId,
      termId,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch timetables" },
      { status: 500 }
    )
  }
}

export async function POSTtimetables(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:timetable:write",
      async () => { },
      { anyOf: ["school:timetable:write"] }
    )

    if (permissionCheck) return permissionCheck

    const timetable = await createTimetable({
      data: body.timetableData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: timetable,
      message: "Timetable created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create timetable" },
      { status: 400 }
    )
  }
}

// ============================================================================
// TIMETABLE LINES API
// ============================================================================

export async function POSTtimetable-lines(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:timetable:write",
      async () => { },
      { anyOf: ["school:timetable:write"] }
    )

    if (permissionCheck) return permissionCheck

    const line = await createTimetableLine({
      data: body.timetableLineData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: line,
      message: "Timetable line created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create timetable line" },
      { status: 400 }
    )
  }
}

// ============================================================================
// LESSON PLANS API
// ============================================================================

export async function GETlesson-plans(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const gradeId = searchParams.get("gradeId")
    subjectId = searchParams.get("subjectId")
    termId = searchParams.get("termId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:lesson-plans:read",
      async () => { },
      { anyOf: ["school:lesson-plans:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getLessonPlans({
      institutionId: institutionId as string,
      gradeId,
      subjectId,
      termId,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch lesson plans" },
      { status: 500 }
    )
  }
}

export async function POSTlesson-plans(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:lesson-plans:write",
      async () => { },
      { anyOf: ["school:lesson-plans:write"] }
    )

    if (permissionCheck) return permissionCheck

    const lessonPlan = await createLessonPlan({
      data: body.lessonPlanData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: lessonPlan,
      message: "Lesson plan created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create lesson plan" },
      { status: 400 }
    )
  }
}

// ============================================================================
// DISCIPLINE API
// ============================================================================

export async function POSTdiscipline-incident(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const reportedBy = body.reportedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:discipline:write",
      async () => { },
      { anyOf: ["school:discipline:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await logDisciplineIncident({
      data: body.incidentData,
      institutionId: institutionId as string,
      reportedById: reportedBy,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Discipline incident logged successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to log discipline incident" },
      { status: 400 }
    )
  }
}

// ============================================================================
// STUDENT DISCIPLINE HISTORY API
// ============================================================================

export async function GETdiscipline-history(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:discipline:read",
      async () => { },
      { anyOf: ["school:discipline:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getDisciplineHistory({
        studentId,
        institutionId: institutionId as string,
      })
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: "Student ID required" },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch discipline history" },
      { status: 500 }
    )
  }
}

// ============================================================================
// CLUBS API
// ============================================================================

export async function GETclubs(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:clubs:read",
      async () => { },
      { anyOf: ["school:clubs:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getClubs({
      institutionId: institutionId as string,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    )
  }
}

export async function POSTclubs(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:clubs:write",
      async () => { },
      { anyOf: ["school:clubs:write"] }
    )

    if (permissionCheck) return permissionCheck

    const club = await createClub({
      data: body.clubData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: club,
      message: "Club created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create club" },
      { status: 400 }
    )
  }
}

// ============================================================================
// CLUB MEMBERSHIP API
// ============================================================================

export async function POSTclub-membership(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:clubs:write",
      async () => { },
      { anyOf: ["school:clubs:write"] }
    )

    if (permissionCheck) return permissionCheck

    const membership = await addClubMember({
      data: body.membershipData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: membership,
      message: "Club membership added successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add club membership" },
      { status: 400 }
    )
  }
}

// ============================================================================
// KPSEA/KJSEA API
// ============================================================================

export async function POSTkpsea-registration(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const registeredBy = body.registeredBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:exams:write",
      async () => { },
      { anyOf: ["school:exams:write"] }
    )

    if (permissionCheck) return permissionCheck

    const registration = await registerKPSEA({
      data: body.kpseaData,
      institutionId: institutionId as string,
      registeredById: registeredBy,
    })

    return NextResponse.json({
      success: true,
      data: registration,
      message: "KPSEA registration successful",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to register for KPSEA" },
      { status: 400 }
    )
  }
}

// ============================================================================
// KJSEA REGISTRATION API
// ============================================================================

export async function POSTkjsea-registration(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const registeredBy = body.registeredBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:exams:write",
      async () => { },
      { anyOf: ["school:exams:write"] }
    )

    if (permissionCheck) return permissionCheck

    const registration = await registerKJSEA({
      data: body.kjseaData,
      institutionId: institutionId as string,
      registeredById: registeredBy,
    })

    return NextResponse.json({
      success: true,
      data: registration,
      message: "KJSEA registration successful",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to register for KJSEA" },
      { status: 400 }
    )
  }
}

// ============================================================================
// REGISTRATION STATUS API
// ============================================================================

export async function GETregistration-status(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:exams:read",
      async () => { },
      { anyOf: ["school:exams:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getRegistrationStatus({
        studentId,
        institutionId: institutionId as string,
      })
      return NextResponse.json(result)
    }

    const result = await getRegistrationStatus({
      studentId: "",
      institutionId: institutionId as string,
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch registration status" },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXPORT FOR MIDDLEWARE
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