/* HR Salary Loans API - SaintsHub
 * GET  /api/hr/payroll/loans          -> list loans (?status=ACTIVE&staffId=) with derived outstanding balance
 * POST /api/hr/payroll/loans          -> { staffId, description, principal, monthlyInstallment, startPeriod?, notes? }
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import {
  resolveInstitutionId,
  listSalaryLoans,
  createSalaryLoan,
} from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = await resolveInstitutionId(searchParams.get("institutionId"))
    const loans = await listSalaryLoans({
      institutionId,
      staffId: searchParams.get("staffId"),
      status: searchParams.get("status"),
    })
    return NextResponse.json({ success: true, data: loans })
  } catch (error: any) {
    console.error("Loans list error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch loans" }, { status: 500 })
  }
}

const createLoanSchema = z.object({
  institutionId: z.string().optional(),
  staffId: z.string().min(1, "Staff member is required"),
  description: z.string().min(1, "Description is required").max(200),
  principal: z.number().positive("Principal must be greater than 0").max(100_000_000),
  monthlyInstallment: z.number().positive("Installment must be greater than 0").max(100_000_000),
  startPeriod: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "startPeriod must be YYYY-MM")
    .optional(),
  notes: z.string().max(500).optional(),
  actorId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = createLoanSchema.parse(await request.json())
    const institutionId = await resolveInstitutionId(body.institutionId)
    const loan = await createSalaryLoan({ ...body, institutionId })
    return NextResponse.json({ success: true, data: loan, message: "Loan granted — deductions start with the next computed run" })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    const msg = error?.message ?? "Failed to create loan"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
