/* route.ts
 * School API - Report Cards
 * Provides: Student report card generation, grade history, academic performance tracking
 */

import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { reportCards, students, assessments } from "@/server/db/schema"
import { eq, and, gte, lte, count, avg } from "drizzle-orm"
import { verifyAuth } from "@/server/auth/auth"

interface ReportCard {
  id: string
  studentId: string
  admissionNumber: string
  studentName: string
  grade: string
  term: string
  overallGrade: string
  gpa: number
  subjects: Array<{
    name: string
    grade: string
    score: number
    maxScore: number
  }>
  attendancePercentage: number
  conductedAt: string
  createdAt: string
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const grade = searchParams.get("grade")
    const term = searchParams.get("term")

    let query = db.select().from(reportCards)

    if (studentId) {
      query = query.where(eq(reportCards.studentId, studentId))
    }
    if (grade) {
      query = query.where(ilike(reportCards.overallGrade, `%${grade}%`))
    }
    if (term) {
      query = query.where(ilike(reportCards.term, `%${term}%`))
    }

    const result = await query.orderBy(reportCards.conductedAt)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Report cards API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      studentId,
      admissionNumber,
      studentName,
      grade,
      term,
      overallGrade,
      gpa,
      subjects,
      attendancePercentage,
    } = body

    if (!studentId || !admissionNumber || !studentName) {
      return NextResponse.json(
        { error: "studentId, admissionNumber and studentName are required" },
        { status: 400 }
      )
    }

    const [reportCard] = await db
      .insert(reportCards)
      .values({
        studentId,
        admissionNumber,
        studentName,
        grade: grade || "",
        term: term || "",
        overallGrade: overallGrade || "",
        gpa: gpa ?? 0,
        subjects: subjects || [],
        attendancePercentage: attendancePercentage ?? 0,
        conductedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning()

    return NextResponse.json({ data: reportCard }, { status: 201 })
  } catch (error) {
    console.error("Report card creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      )
    }

    const [updated] = await db
      .update(reportCards)
      .set(updates)
      .where(eq(reportCards.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: "Report card not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Report card update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      )
    }

    const deleted = await db
      .delete(reportCards)
      .where(eq(reportCards.id, id))

    if (deleted.rowCount === 0) {
      return NextResponse.json(
        { error: "Report card not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Report card deletion API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}