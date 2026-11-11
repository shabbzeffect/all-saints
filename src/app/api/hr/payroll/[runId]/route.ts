/* HR Payroll Run API - SaintsHub
 * GET   /api/hr/payroll/[runId]  -> run detail with payslips                 [hr:payroll:read]
 * PATCH /api/hr/payroll/[runId]  -> { action: "compute"|"cancel" (run) | "finalize" (finalize) }
 * Maker-checker: the user who created a run cannot finalize it.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requirePayroll } from "@/server/payroll-access"
import {
  getPayrollRun,
  computePayrollRun,
  finalizePayrollRun,
  cancelPayrollRun,
} from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const gate = await requirePayroll("hr:payroll:read")
  if ("error" in gate) return gate.error
  const { institutionId } = gate.access

  try {
    const run = await getPayrollRun({ runId: params.runId, institutionId })
    return NextResponse.json({ success: true, data: run })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch payroll run"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 500 })
  }
}

const patchSchema = z.object({
  action: z.enum(["compute", "finalize", "cancel"]),
  adjustments: z
    .array(z.object({ staffId: z.string(), allowances: z.number().min(0), notes: z.string().max(200).optional() }))
    .optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { runId: string } }
) {
  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  }

  const permission = body.action === "finalize" ? "hr:payroll:finalize" : "hr:payroll:run"
  const gate = await requirePayroll(permission)
  if ("error" in gate) return gate.error
  const { institutionId, userId } = gate.access

  try {
    let data
    switch (body.action) {
      case "compute":
        data = await computePayrollRun({
          runId: params.runId,
          institutionId,
          adjustments: body.adjustments,
        })
        break
      case "finalize":
        data = await finalizePayrollRun({
          runId: params.runId,
          institutionId,
          finalizedById: userId,
        })
        break
      case "cancel":
        data = await cancelPayrollRun({
          runId: params.runId,
          institutionId,
          actorId: userId,
        })
        break
    }

    const pastTense = body.action === "compute" ? "computed" : body.action === "finalize" ? "finalized" : "cancelled"
    return NextResponse.json({ success: true, data, message: `Run ${pastTense}` })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to update payroll run"
    const lowered = msg.toLowerCase()
    const status = msg.includes("not found") ? 404 : lowered.includes("cannot") || lowered.includes("maker-checker") ? 409 : 400
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
