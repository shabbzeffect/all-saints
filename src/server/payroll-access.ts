/* payroll-access.ts
 * Payroll route guard built on the shared portal RBAC (rbac.ts).
 * Kept as a thin wrapper for payroll's error-response shape ({ success, error }).
 */

import { NextResponse } from "next/server"
import { getMembershipContext, type MembershipContext } from "@/server/rbac"
import { prisma } from "@/server/db"

export interface PayrollAccess {
  userId: string
  institutionId: string
  permissions: Set<string>
}

export type AccessGate = { error: NextResponse } | { access: PayrollAccess }

const json = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status })

/** Require a payroll permission for the current signed-in user. */
export async function requirePayroll(permission: string): Promise<AccessGate> {
  const gate = await getMembershipContext()
  if ("error" in gate) return { error: gate.error }

  const { membership } = gate
  if (!membership.permissions.has(permission)) {
    await prisma.auditEvent
      .create({
        data: {
          actorId: membership.userId,
          action: "READ",
          targetType: "Permission",
          targetName: permission,
          institutionId: membership.institutionId,
          metadata: {
            action: "payroll_access_denied",
            required: permission,
            userHas: [...membership.permissions],
          },
        },
      })
      .catch(() => {}) // audit failure must not mask the denial
    return { error: json(403, `Requires permission: ${permission}`) }
  }

  return {
    access: {
      userId: membership.userId,
      institutionId: membership.institutionId,
      permissions: membership.permissions,
    },
  }
}
