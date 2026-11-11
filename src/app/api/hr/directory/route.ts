/* HR Directory API - SaintsHub
 * GET /api/hr/directory -> live staff directory, recent leave, HR summary  [portal:staff:read]
 * Salary figures intentionally excluded from this payload.
 */

import { NextResponse } from "next/server"
import { requireAccess } from "@/server/rbac"
import { getHrDirectory } from "@/server/services/hr/directory.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const data = await getHrDirectory(membership.institutionId)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("HR directory error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staff directory" }, { status: 500 })
  }
}
