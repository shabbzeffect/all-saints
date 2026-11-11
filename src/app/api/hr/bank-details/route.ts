/* HR Bank Details API - SaintsHub
 * GET   /api/hr/bank-details  -> list staff bank details (admin view)     [portal:admin:write]
 * PATCH /api/hr/bank-details  -> update one staff member's bank details   [portal:admin:write]
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAccess } from "@/server/rbac"
import { listBankDetails, updateStaffBankDetails } from "@/server/services/hr/banking.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:admin:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const rows = await listBankDetails(membership.institutionId)
    const complete = rows.filter((r) => r.complete).length
    return NextResponse.json({ success: true, data: rows, summary: { total: rows.length, complete } })
  } catch (error: any) {
    console.error("Bank details error:", error)
    return NextResponse.json({ success: false, error: "Failed to load bank details" }, { status: 500 })
  }
}

const patchSchema = z.object({
  staffId: z.string().min(1),
  bankName: z.string().min(2, "Bank name is required").max(100),
  bankBranch: z.string().max(100).nullish(),
  bankAccount: z.string().min(5).max(20),
  bankCode: z.string().max(20).nullish(),
})

export async function PATCH(request: Request) {
  const gate = await requireAccess("portal:admin:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await request.json())
  } catch (error: any) {
    const msg = error?.issues?.[0]?.message ?? "Invalid bank details"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }

  try {
    const updated = await updateStaffBankDetails(
      {
        institutionId: membership.institutionId,
        staffId: body.staffId,
        data: body,
        actorId: membership.userId,
      }
    )
    return NextResponse.json({ success: true, data: updated, message: "Bank details saved" })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to save bank details"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 400 })
  }
}
