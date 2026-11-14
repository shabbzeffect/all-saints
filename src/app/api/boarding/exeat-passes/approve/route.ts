import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const gate = await requireAccess("portal:staff:write")
    if ("error" in gate) return gate.error
    const { membership } = gate
    const institutionId = membership.institutionId

    const { searchParams } = new URL(request.url)
    const passId = searchParams.get("id") ?? ""
    if (!passId) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const status = typeof body?.status === "string" ? body.status.toUpperCase() : ""
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ success: false, error: "status must be APPROVED or REJECTED" }, { status: 400 })
    }

    const pass = await prisma.exeatPass.findFirst({
      where: { id: passId, student: { institutionId } },
      select: { id: true, status: true },
    })
    if (!pass) {
      return NextResponse.json({ success: false, error: "Exeat pass not found" }, { status: 404 })
    }
    if (pass.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Only pending passes can be decided" }, { status: 409 })
    }

    const updated = await prisma.exeatPass.update({
      where: { id: pass.id },
      data: { status, approvedBy: membership.userId, approvedAt: new Date() },
    })

    await prisma.auditEvent.create({
      data: {
        actorId: membership.userId,
        action: "UPDATE",
        targetType: "ExeatPass",
        targetId: updated.id,
        institutionId,
        metadata: { action: "decide_exeat_pass", status },
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      data: { id: updated.id, status: updated.status, approvedBy: updated.approvedBy, approvedAt: updated.approvedAt?.toISOString() ?? null },
    })
  } catch (error) {
    console.error("Approve exeat pass error:", error)
    return NextResponse.json({ success: false, error: "Failed to decide exeat pass" }, { status: 500 })
  }
}
