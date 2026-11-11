/* HR Payroll Run API - SaintsHub
 * GET   /api/hr/payroll/[runId]  -> run detail with payslips
 * PATCH /api/hr/payroll/[runId]  -> { action: "compute" | "finalize" | "cancel" }
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import {
  resolveInstitutionId,
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
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = await resolveInstitutionId(searchParams.get("institutionId"))
    const run = await getPayrollRun({ runId: params.runId, institutionId })
    return NextResponse.json({ success: true, data: run })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch payroll run"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 500 })
  }
}

const patchSchema = z.object({
  institutionId: z.string().optional(),
  action: z.enum(["compute", "finalize", "cancel"]),
  actorId: z.string().optional(),
  adjustments: z
    .array(z.object({ staffId: z.string(), allowances: z.number().min(0), notes: z.string().max(200).optional() }))
    .optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const body = patchSchema.parse(await request.json())
    const institutionId = await resolveInstitutionId(body.institutionId)

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
          finalizedById: body.actorId,
        })
        break
      case "cancel":
        data = await cancelPayrollRun({
          runId: params.runId,
          institutionId,
          actorId: body.actorId,
        })
        break
    }

    return NextResponse.json({ success: true, data, message: `Run ${body.action}d` })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
    const msg = error?.message ?? "Failed to update payroll run"
    const status = msg.includes("not found") ? 404 : msg.includes("Cannot") ? 409 : 400
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
