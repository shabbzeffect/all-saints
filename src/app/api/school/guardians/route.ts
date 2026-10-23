/* route.ts
 * School API - Guardians
 * Provides: Guardian management, student-guardian associations, contact updates
 */

import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { guardians, students } from "@/server/db/schema"
import { eq, and, ilike } from "drizzle-orm"
import { verifyAuth } from "@/server/auth/auth"

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const relationship = searchParams.get("relationship")
    const status = searchParams.get("status")

    let query = db.select().from(guardians)

    if (name) {
      query = query.where(ilike(guardians.fullName, `%${name}%`))
    }
    if (relationship) {
      query = query.where(ilike(guardians.relationship, `%${relationship}%`))
    }
    if (status) {
      query = query.where(ilike(guardians.status, `%${status}%`))
    }

    const result = await query
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Guardians API error:", error)
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
    const { fullName, relationship, phone, email, studentId, status } = body

    if (!fullName || !relationship || !studentId) {
      return NextResponse.json(
        { error: "fullName, relationship and studentId are required" },
        { status: 400 }
      )
    }

    const [guardian] = await db
      .insert(guardians)
      .values({
        fullName,
        relationship,
        phone: phone || "",
        email: email || "",
        studentId,
        status: status || "active",
      })
      .returning()

    return NextResponse.json({ data: guardian }, { status: 201 })
  } catch (error) {
    console.error("Guardian creation API error:", error)
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
      .update(guardians)
      .set(updates)
      .where(eq(guardians.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: "Guardian not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Guardian update API error:", error)
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
      .delete(guardians)
      .where(eq(guardians.id, id))

    if (deleted.rowCount === 0) {
      return NextResponse.json(
        { error: "Guardian not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Guardian deletion API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}