/* payroll-access.ts
 * Access control for payroll API routes - SaintsHub
 * Signed-in user -> ACTIVE institution membership -> role permissions.
 * Institution scoping comes from the membership (never from query params).
 * Denials are audited; every allowed mutation should pass the acting user id
 * into the service for audit attribution.
 */

import { NextResponse } from "next/server"
import { auth } from "@/server/auth/auth"
import { prisma } from "@/server/db"

export interface PayrollAccess {
  userId: string
  institutionId: string
  permissions: Set<string>
}

export type AccessGate = { error: NextResponse } | { access: PayrollAccess }

const json = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status })

/** Require a permission for the current signed-in user.
 * Returns either a 401/403 NextResponse (caller must return it) or the access context. */
export async function requirePayroll(permission: string): Promise<AccessGate> {
  const session = await auth()
  const sessionUser = session?.user as { id?: string; email?: string | null } | undefined
  if (!sessionUser) {
    return { error: json(401, "Not signed in") }
  }

  let userId = sessionUser.id ?? null
  if (!userId && sessionUser.email) {
    const user = await prisma.user.findUnique({ where: { email: sessionUser.email }, select: { id: true } })
    userId = user?.id ?? null
  }
  if (!userId) {
    return { error: json(401, "Not signed in") }
  }

  const membership = await prisma.institutionMembership.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      userRoles: {
        where: { isActive: true },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      },
    },
  })

  if (!membership) {
    return { error: json(403, "No active institution membership") }
  }

  const permissions = new Set<string>()
  for (const ur of membership.userRoles) {
    for (const rp of ur.role.permissions) {
      permissions.add(rp.permission.key)
    }
  }

  if (!permissions.has(permission)) {
    await prisma.auditEvent
      .create({
        data: {
          actorId: userId,
          action: "READ",
          targetType: "Permission",
          targetName: permission,
          institutionId: membership.institutionId,
          metadata: {
            action: "payroll_access_denied",
            required: permission,
            userHas: [...permissions],
          },
        },
      })
      .catch(() => {}) // audit failure must not mask the denial
    return { error: json(403, `Requires permission: ${permission}`) }
  }

  return { access: { userId, institutionId: membership.institutionId, permissions } }
}
