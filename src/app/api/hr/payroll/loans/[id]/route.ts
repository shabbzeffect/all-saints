/* HR Salary Loan Detail API - SaintsHub
 * GET   /api/hr/payroll/loans/[id]  -> loan with repayment history
 * PATCH /api/hr/payroll/loans/[id]  -> { action: "cancel" | "settle" }
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requirePayroll } from "@/server/payroll-access"
import {
  getSalaryLoan,
  updateSalaryLoanStatus,
} from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requirePayroll("hr:payroll:read")
  if ("error" in gate) return gate.error
  const { institutionId } = gate.access

  try {
    const loan = await getSalaryLoan({ id: params.id, institutionId })
    return NextResponse.json({ success: true, data: loan })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch loan"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 500 })
  }
}

const patchSchema = z.object({
  action: z.enum(["cancel", "settle"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requirePayroll("hr:payroll:loans")
  if ("error" in gate) return gate.error
  const { institutionId, userId } = gate.access

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  }

  try {
    const loan = await updateSalaryLoanStatus({
      id: params.id,
      institutionId,
      action: body.action,
      actorId: userId,
    })
    return NextResponse.json({ success: true, data: loan, message: `Loan ${body.action === "cancel" ? "cancelled" : "settled"}` })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
    const msg = error?.message ?? "Failed to update loan"
    const status = msg.includes("not found") ? 404 : msg.includes("still has") ? 409 : 400
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
