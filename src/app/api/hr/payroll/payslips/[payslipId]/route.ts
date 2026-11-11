/* HR Payslip API - SaintsHub
 * GET /api/hr/payroll/payslips/[payslipId] -> payslip detail with line items   [hr:payroll:read]
 */

import { NextResponse } from "next/server"
import { requirePayroll } from "@/server/payroll-access"
import { getPayslip } from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { payslipId: string } }
) {
  const gate = await requirePayroll("hr:payroll:read")
  if ("error" in gate) return gate.error
  const { institutionId } = gate.access

  try {
    const payslip = await getPayslip({ payslipId: params.payslipId, institutionId })
    return NextResponse.json({ success: true, data: payslip })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch payslip"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 500 })
  }
}
