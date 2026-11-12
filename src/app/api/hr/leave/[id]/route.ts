/* HR Leave Request API - SaintsHub
 * PATCH /api/hr/leave/[id] -> { action: "approve" | "reject" | "cancel" }
 * approve/reject: portal:admin:write · cancel: owner of a pending request (or an admin)
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAccess } from "@/server/rbac"
import { updateLeaveRequestStatus } from "@/server/services/hr/leave.service"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "cancel"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate
  const isAdmin = membership.permissions.has("portal:admin:write")

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  }

  try {
    const updated = await updateLeaveRequestStatus({
      institutionId: membership.institutionId,
      userId: membership.userId,
      requestId: params.id,
      action: body.action,
      actorId: membership.userId,
      isAdmin,
    })
    return NextResponse.json({ success: true, data: updated, message: `Leave request ${body.action}d` })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to update leave request"
    const status = msg.includes("not found") ? 404 : msg.toLowerCase().includes("admin") ? 403 : 400
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
