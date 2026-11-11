/* HR Payroll API - SaintsHub
 * GET  /api/hr/payroll            -> list runs (?limit=) | summary (?summary=1)   [hr:payroll:read]
 * POST /api/hr/payroll            -> create run for month/year (+ compute)        [hr:payroll:run]
 * Institution scoping comes from the signed-in user's ACTIVE membership.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requirePayroll } from "@/server/payroll-access"
import {
  listPayrollRuns,
  getPayrollSummary,
  createPayrollRun,
  computePayrollRun,
} from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requirePayroll("hr:payroll:read")
  if ("error" in gate) return gate.error
  const { institutionId } = gate.access

  try {
    const { searchParams } = new URL(request.url)

    if (searchParams.get("summary") === "1") {
      const summary = await getPayrollSummary(institutionId)
      return NextResponse.json({ success: true, data: summary })
    }

    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "24") || 24, 1), 100)
    const runs = await listPayrollRuns({ institutionId, limit })
    return NextResponse.json({ success: true, data: runs })
  } catch (error: any) {
    console.error("Payroll list error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payroll data" }, { status: 500 })
  }
}

const createRunSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  payDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  compute: z.boolean().optional(), // default true
})

export async function POST(request: Request) {
  const gate = await requirePayroll("hr:payroll:run")
  if ("error" in gate) return gate.error
  const { institutionId, userId } = gate.access

  try {
    const body = createRunSchema.parse(await request.json())

    const run = await createPayrollRun({
      institutionId,
      month: body.month,
      year: body.year,
      payDate: body.payDate ? new Date(body.payDate) : undefined,
      createdById: userId,
      notes: body.notes,
    })

    if (body.compute !== false) {
      const computed = await computePayrollRun({ runId: run.id, institutionId })
      return NextResponse.json({
        success: true,
        data: computed,
        message: `Payroll run ${run.period} created and computed`,
      })
    }

    return NextResponse.json({ success: true, data: run, message: `Payroll run ${run.period} created` })
  } catch (error: any) {
    if (error?.code === "DUPLICATE") {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 })
    }
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("Payroll create error:", error)
    return NextResponse.json({ success: false, error: error?.message ?? "Failed to create payroll run" }, { status: 400 })
  }
}
