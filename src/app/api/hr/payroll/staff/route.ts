/* HR Staff Options API - SaintsHub
 * GET /api/hr/payroll/staff -> minimal ACTIVE staff list for payroll forms (id, name, role, basic salary)
 */

import { NextResponse } from "next/server"
import { requirePayroll } from "@/server/payroll-access"
import { listStaffForLoans } from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requirePayroll("hr:payroll:read")
  if ("error" in gate) return gate.error
  const { institutionId } = gate.access

  try {
    const staff = await listStaffForLoans(institutionId)
    return NextResponse.json({ success: true, data: staff })
  } catch (error: any) {
    console.error("Payroll staff options error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staff list" }, { status: 500 })
  }
}
