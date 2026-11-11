/* Staff Self-Service Payslips - SaintsHub
 * GET /api/hr/payroll/mine -> your own FINAL payslips (no payroll permission needed)
 * Scoped strictly to the Staff row linked to the signed-in user.
 */

import { NextResponse } from "next/server"
import { requireSession } from "@/server/rbac"
import { getMyPayslips } from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireSession()
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const result = await getMyPayslips(membership.userId)
    if (!result) {
      return NextResponse.json(
        { success: false, error: "You are not provisioned as staff yet — ask HR to link your account" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("My payslips error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch your payslips" }, { status: 500 })
  }
}
