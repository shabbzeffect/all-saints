/* HR Leave Types API - SaintsHub
 * PATCH /api/hr/leave/types -> { id, carryOverCap }  [portal:admin:write]
 * Edit a leave type's carry-over cap (days allowed to roll into next year).
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAccess } from "@/server/rbac"
import { updateLeaveType } from "@/server/services/hr/leave.service"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  id: z.string().min(1),
  carryOverCap: z.number().min(0).max(60),
})

export async function PATCH(request: Request) {
  const gate = await requireAccess("portal:admin:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await request.json())
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.issues?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  try {
    const data = await updateLeaveType({
      institutionId: membership.institutionId,
      actorId: membership.userId,
      leaveTypeId: body.id,
      carryOverCap: body.carryOverCap,
    })
    return NextResponse.json({ success: true, data, message: "Carry-over cap updated" })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to update leave type"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 400 })
  }
}
