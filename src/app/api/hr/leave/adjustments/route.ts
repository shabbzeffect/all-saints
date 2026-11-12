/* HR Leave Adjustments API - SaintsHub
 * GET    /api/hr/leave/adjustments  -> adjustments (admins see all; others see own)  [portal:staff:read]
 * POST   /api/hr/leave/adjustments  -> create adjustment (delegates validation)       [portal:admin:write]
 * DELETE /api/hr/leave/adjustments  -> remove adjustment (body: { id })               [portal:admin:write]
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAccess } from "@/server/rbac"
import {
  listLeaveAdjustments,
  createLeaveAdjustment,
  deleteLeaveAdjustment,
} from "@/server/services/hr/leave.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate
  const isAdmin = membership.permissions.has("portal:admin:write")

  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined
    const data = await listLeaveAdjustments({
      institutionId: membership.institutionId,
      userId: membership.userId,
      staffId: searchParams.get("staffId") ?? undefined,
      year: Number.isFinite(year) ? year : undefined,
      isAdmin,
    })
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("List adjustments error:", error)
    return NextResponse.json({ success: false, error: "Failed to list adjustments" }, { status: 500 })
  }
}

const createSchema = z.object({
  staffId: z.string().min(1),
  leaveTypeId: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  delta: z.number().min(-200).max(200).refine((n) => n !== 0, "Delta cannot be zero"),
  reason: z.string().min(1, "Reason is required").max(300),
})

export async function POST(request: Request) {
  const gate = await requireAccess("portal:admin:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await request.json())
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.issues?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  try {
    const data = await createLeaveAdjustment({
      institutionId: membership.institutionId,
      actorId: membership.userId,
      ...body,
    })
    return NextResponse.json({ success: true, data, message: "Adjustment applied" }, { status: 201 })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to create adjustment"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

const deleteSchema = z.object({ id: z.string().min(1) })

export async function DELETE(request: Request) {
  const gate = await requireAccess("portal:admin:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  let body: z.infer<typeof deleteSchema>
  try {
    body = deleteSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
  }

  try {
    const data = await deleteLeaveAdjustment({
      institutionId: membership.institutionId,
      actorId: membership.userId,
      adjustmentId: body.id,
    })
    return NextResponse.json({ success: true, data, message: "Adjustment removed" })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to delete adjustment"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 400 })
  }
}
