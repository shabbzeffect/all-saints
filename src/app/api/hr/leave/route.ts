/* HR Leave API - SaintsHub
 * GET  /api/hr/leave  -> own leave overview (balances + history); admins also see the approval queue
 * POST /api/hr/leave  -> create your own leave request
 * Rules: staff see only their own data; approve/reject requires portal:admin:write;
 * cancellation is allowed for the owner of a pending request (or an admin).
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAccess } from "@/server/rbac"
import {
  getLeaveOverview,
  createLeaveRequest,
  listLeaveTypes,
} from "@/server/services/hr/leave.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate
  const isAdmin = membership.permissions.has("portal:admin:write")

  try {
    const [overview, types] = await Promise.all([
      getLeaveOverview({ institutionId: membership.institutionId, userId: membership.userId, isAdmin }),
      listLeaveTypes(membership.institutionId),
    ])
    return NextResponse.json({ success: true, data: { ...overview, types, isAdmin } })
  } catch (error: any) {
    console.error("Leave overview error:", error)
    return NextResponse.json({ success: false, error: "Failed to load leave data" }, { status: 500 })
  }
}

const createSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(10, "Start date is required"),
  endDate: z.string().min(10, "End date is required"),
  daysRequested: z.number().positive().max(365).optional(),
  reason: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  const gate = await requireAccess("portal:staff:read")
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

  const startDate = new Date(body.startDate)
  const endDate = new Date(body.endDate)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ success: false, error: "Invalid dates" }, { status: 400 })
  }

  try {
    const created = await createLeaveRequest({
      institutionId: membership.institutionId,
      userId: membership.userId,
      leaveTypeId: body.leaveTypeId,
      startDate,
      endDate,
      daysRequested: body.daysRequested,
      reason: body.reason,
    })
    return NextResponse.json({ success: true, data: created, message: "Leave request submitted" }, { status: 201 })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to submit leave request"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
