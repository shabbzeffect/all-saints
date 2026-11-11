/* HR Staff Options API - SaintsHub
 * GET /api/hr/payroll/staff -> minimal ACTIVE staff list for payroll forms (id, name, role, basic salary)
 */

import { NextResponse } from "next/server"
import { resolveInstitutionId, listStaffForLoans } from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = await resolveInstitutionId(searchParams.get("institutionId"))
    const staff = await listStaffForLoans(institutionId)
    return NextResponse.json({ success: true, data: staff })
  } catch (error: any) {
    console.error("Payroll staff options error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staff list" }, { status: 500 })
  }
}
