/* route.ts
 * School API - Enrolments
 * Provides: Student enrolment management, class assignments, promotion tracking
 */

import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { enrollments, students, classes } from "@/server/db/schema"
import { eq, and, ilike } from "drizzle-orm"
import { verifyAuth } from "@/server/auth/auth"

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get("grade")
    const status = searchParams.get("status")
    const className = searchParams.get("class")

    let query = db.select().from(enrollments)

    if (grade) {
      query = query.where(ilike(enrollments.grade, `%${grade}%`))
    }
    if (status) {
      query = query.where(ilike(enrollments.status, `%${status}%`))
    }
    if (className) {
      query = query.where(ilike(enrollments.className, `%${className}%`))
    }

    const result = await query
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Enrolments API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, className, section, academicYear } = body

    if (!studentId || !className) {
      return NextResponse.json(
        { error: "studentId and className are required" },
        { status: 400 }
      )
    }

    const [enrollment] = await db
      .insert(enrollments)
      .values({
        studentId,
        className,
        section,
        academicYear: academicYear || new Date().getFullYear(),
        status: "pending",
      })
      .returning()

    return NextResponse.json({ data: enrollment }, { status: 201 })
  } catch (error) {
    console.error("Enrolment creation API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}