/* Report Cards API - SaintsHub School
 * GET    /api/school/report-cards          -> list report cards (studentId, termId, status) [portal:staff:read]
 * DELETE /api/school/report-cards?id=...   -> delete a report card record                  [portal:admin:write]
 * Note: report card GENERATION lives in the academics workflow
 *       (assessment → report-cards service), not in this CRUD endpoint.
 */

import { NextResponse } from "next/server"
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
    const termId = searchParams.get("termId")
    const status = searchParams.get("status")

    const cards = await prisma.reportCard.findMany({
      where: {
        institutionId: membership.institutionId,
        ...(studentId ? { studentId } : {}),
        ...(termId ? { termId } : {}),
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        studentId: true,
        termId: true,
        gradeId: true,
        status: true,
        issuedAt: true,
        distributed: true,
        distributedAt: true,
        parentAcknowledged: true,
        parentAcknowledgedAt: true,
        student: {
          select: { firstName: true, lastName: true, gradeId: true },
        },
        term: { select: { name: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 200,
    })
    return NextResponse.json({ success: true, data: cards })
  } catch (error) {
    console.error("Report cards list error:", error)
    return NextResponse.json({ success: false, error: "Failed to list report cards" }, { status: 500 })
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
    const result = await prisma.reportCard.deleteMany({
      where: { id, institutionId: membership.institutionId },
    })
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Report card not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Report card delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete report card" }, { status: 500 })
  }
}
