/* Enrolments API - SaintsHub School
 * GET  /api/school/enrolments  -> list enrolments (studentId, gradeId, termId, status) [portal:staff:read]
 * POST /api/school/enrolments  -> enrol a student in grade/term                      [portal:staff:write]
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const gradeId = searchParams.get("gradeId")
    const termId = searchParams.get("termId")
    const status = searchParams.get("status")

    const enrolments = await prisma.enrolment.findMany({
      where: {
        institutionId: membership.institutionId,
        ...(studentId ? { studentId } : {}),
        ...(gradeId ? { gradeId } : {}),
        ...(termId ? { termId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gradeId: true,
            status: true,
          },
        },
        grade: { select: { id: true, name: true, level: true } },
        term: { select: { id: true, name: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 200,
    })
    return NextResponse.json({ success: true, data: enrolments })
  } catch (error) {
    console.error("Enrolments list error:", error)
    return NextResponse.json({ success: false, error: "Failed to list enrolments" }, { status: 500 })
  }
}

const createSchema = z.object({
  studentId: z.string().min(1),
  gradeId: z.string().min(1),
  termId: z.string().min(1),
  status: z.string().max(30).optional(),
})

export async function POST(request: Request) {
  const gate = await requireAccess("portal:staff:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const body = createSchema.parse(await request.json())

    const [student, grade, term] = await Promise.all([
      prisma.student.findFirst({
        where: { id: body.studentId, institutionId: membership.institutionId },
        select: { id: true },
      }),
      prisma.grade.findUnique({ where: { id: body.gradeId }, select: { id: true } }),
      prisma.term.findUnique({ where: { id: body.termId }, select: { id: true } }),
    ])
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
    }
    if (!grade || !term) {
      return NextResponse.json({ success: false, error: "Grade or term not found" }, { status: 404 })
    }

    const existing = await prisma.enrolment.findFirst({
      where: { studentId: body.studentId, gradeId: body.gradeId, termId: body.termId },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: "Student is already enrolled for this grade and term" }, { status: 409 })
    }

    const enrolment = await prisma.enrolment.create({
      data: {
        institutionId: membership.institutionId,
        studentId: body.studentId,
        gradeId: body.gradeId,
        termId: body.termId,
        status: body.status ?? "ACTIVE",
      },
    })
    return NextResponse.json({ success: true, data: enrolment }, { status: 201 })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("Enrolment create error:", error)
    return NextResponse.json({ success: false, error: "Failed to enrol student" }, { status: 500 })
  }
}
