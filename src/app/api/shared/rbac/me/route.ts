/* Current User RBAC Context - SaintsHub
 * GET /api/shared/rbac/me -> my institution, roles and permission keys (for client-side UI visibility)
 */

import { NextResponse } from "next/server"
import { requireAccess } from "@/server/rbac"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  return NextResponse.json({
    success: true,
    data: {
      userId: membership.userId,
      institutionId: membership.institutionId,
      roleKeys: membership.roleKeys,
      permissions: [...membership.permissions],
    },
  })
}
