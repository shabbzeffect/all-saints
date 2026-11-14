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

    const body = await request.json().catch(() => null)
    const roomId = typeof body?.roomId === "string" ? body.roomId.trim() : ""
    if (!roomId) {
      return NextResponse.json({ success: false, error: "roomId is required" }, { status: 400 })
    }

    const room = await prisma.room.findFirst({
      where: { id: roomId, dormitory: { institutionId } },
      select: { id: true, capacity: true },
    })
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found in this institution" }, { status: 404 })
    }

    const data: { currentStudents?: number; isActive?: boolean; features?: string[] } = {}

    if (body.currentStudents !== undefined) {
      const n = Number(body.currentStudents)
      if (!Number.isInteger(n) || n < 0 || n > room.capacity) {
        return NextResponse.json(
          { success: false, error: `currentStudents must be an integer between 0 and ${room.capacity}` },
          { status: 400 },
        )
      }
      data.currentStudents = n
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json({ success: false, error: "isActive must be a boolean" }, { status: 400 })
      }
      data.isActive = body.isActive
    }
    if (body.features !== undefined) {
      if (!Array.isArray(body.features) || body.features.some((f: unknown) => typeof f !== "string")) {
        return NextResponse.json({ success: false, error: "features must be an array of strings" }, { status: 400 })
      }
      data.features = body.features.map((f: string) => f.trim()).filter(Boolean)
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "No updatable fields provided" }, { status: 400 })
    }

    const updated = await prisma.room.update({ where: { id: room.id }, data })

    await prisma.auditEvent
      .create({
        data: {
          actorId: membership.userId,
          action: "UPDATE",
          targetType: "Room",
          targetId: updated.id,
          institutionId,
          metadata: { action: "update_room", fields: Object.keys(data) },
        },
      })
      .catch(() => {})

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        currentStudents: updated.currentStudents,
        isActive: updated.isActive,
        features: updated.features,
        updatedAt: updated.updatedAt.toISOString(),
      },
      message: "Room updated",
    })
  } catch (error) {
    console.error("Update room PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update room" }, { status: 500 })
  }
}
