/* HR Payslip API - SaintsHub
 * GET /api/hr/payroll/payslips/[payslipId] -> payslip detail with line items
 */

import { NextResponse } from "next/server"
import { resolveInstitutionId, getPayslip } from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { payslipId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = await resolveInstitutionId(searchParams.get("institutionId"))
    const payslip = await getPayslip({ payslipId: params.payslipId, institutionId })
    return NextResponse.json({ success: true, data: payslip })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch payslip"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 500 })
  }
}
