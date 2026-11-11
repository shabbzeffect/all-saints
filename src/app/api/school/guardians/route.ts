/* Guardians API - SaintsHub School
 * GET    /api/school/guardians          -> list guardians (search, limit)   [portal:staff:read]
 * POST   /api/school/guardians          -> create guardian (+ optional student link) [portal:staff:write]
 * PUT    /api/school/guardians          -> update guardian by id             [portal:staff:write]
 * DELETE /api/school/guardians?id=...   -> delete guardian                   [portal:admin:write]
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { GuardianRelationship } from "@prisma/client"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

export const dynamic = "force-dynamic"

const RELATIONSHIPS = Object.values(GuardianRelationship)

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") ?? "").trim()
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50") || 50, 1), 200)

    const where: any = { institutionId: membership.institutionId }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ]
    }

    const guardians = await prisma.guardian.findMany({
      where,
      orderBy: { firstName: "asc" },
      take: limit,
      include: { _count: { select: { studentGuardians: true } } },
    })
    return NextResponse.json({ success: true, data: guardians })
  } catch (error) {
    console.error("Guardians list error:", error)
    return NextResponse.json({ success: false, error: "Failed to list guardians" }, { status: 500 })
  }
}

const createSchema = z.object({
  firstName: z.string().min(1).max(120),
  lastName: z.string().max(120).optional(),
  relationship: z.enum(RELATIONSHIPS as [GuardianRelationship, ...GuardianRelationship[]]),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal("")),
  idNumber: z.string().max(40).optional(),
  occupation: z.string().max(120).optional(),
  primaryPayer: z.boolean().optional(),
  pickupAuthorised: z.boolean().optional(),
  studentId: z.string().optional(),
})

export async function POST(request: Request) {
  const gate = await requireAccess("portal:staff:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const body = createSchema.parse(await request.json())

    if (body.studentId) {
      const student = await prisma.student.findFirst({
        where: { id: body.studentId, institutionId: membership.institutionId },
        select: { id: true },
      })
      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
      }
    }

    const guardian = await prisma.$transaction(async (tx) => {
      const g = await tx.guardian.create({
        data: {
          institutionId: membership.institutionId,
          firstName: body.firstName.trim(),
          lastName: body.lastName?.trim() || null,
          relationship: body.relationship,
          phone: body.phone.trim(),
          email: body.email || null,
          idNumber: body.idNumber || null,
          occupation: body.occupation || null,
          primaryPayer: body.primaryPayer ?? false,
          pickupAuthorised: body.pickupAuthorised ?? false,
        },
      })
      if (body.studentId) {
        await tx.studentGuardian.create({
          data: {
            institutionId: membership.institutionId,
            studentId: body.studentId,
            guardianId: g.id,
            primaryPayer: body.primaryPayer ?? false,
            canPickUp: body.pickupAuthorised ?? false,
          },
        })
      }
      return g
    })

    return NextResponse.json({ success: true, data: guardian }, { status: 201 })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("Guardian create error:", error)
    return NextResponse.json({ success: false, error: "Failed to create guardian" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const gate = await requireAccess("portal:staff:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const body = await request.json()
    const { id, ...updates } = body ?? {}
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }

    const allowed: any = {}
    if (updates.firstName) allowed.firstName = String(updates.firstName).slice(0, 120)
    if (updates.lastName !== undefined) allowed.lastName = updates.lastName ? String(updates.lastName).slice(0, 120) : null
    if (updates.phone) allowed.phone = String(updates.phone).slice(0, 30)
    if (updates.email !== undefined) allowed.email = updates.email || null
    if (updates.occupation !== undefined) allowed.occupation = updates.occupation ? String(updates.occupation).slice(0, 120) : null
    if (updates.primaryPayer !== undefined) allowed.primaryPayer = Boolean(updates.primaryPayer)
    if (updates.pickupAuthorised !== undefined) allowed.pickupAuthorised = Boolean(updates.pickupAuthorised)

    const result = await prisma.guardian.updateMany({
      where: { id, institutionId: membership.institutionId },
      data: allowed,
    })
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Guardian not found" }, { status: 404 })
    }
    const guardian = await prisma.guardian.findUnique({ where: { id } })
    return NextResponse.json({ success: true, data: guardian })
  } catch (error) {
    console.error("Guardian update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update guardian" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAccess("portal:admin:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }
    const result = await prisma.guardian.deleteMany({
      where: { id, institutionId: membership.institutionId },
    })
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Guardian not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Guardian delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete guardian" }, { status: 500 })
  }
}
