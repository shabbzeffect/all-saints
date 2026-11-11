/* rbac.ts
 * Shared portal RBAC - SaintsHub
 * One implementation of: session -> user -> ACTIVE membership -> role permissions.
 * Used by feature route handlers (permission checks) and payroll (see payroll-access.ts).
 */

import { NextResponse } from "next/server"
import { auth } from "@/server/auth/auth"
import { prisma } from "@/server/db"

export interface MembershipContext {
  userId: string
  institutionId: string
  roleKeys: string[]
  permissions: Set<string>
}

export type MembershipGate = { error: NextResponse } | { membership: MembershipContext }

const json = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status })

/** Resolve the signed-in user's membership and permission set (null if unauthenticated) */
export async function getMembershipContext(): Promise<MembershipGate> {
  const session = await auth()
  const sessionUser = session?.user as { id?: string; email?: string | null } | undefined
  if (!sessionUser) return { error: json(401, "Not signed in") }

  let userId = sessionUser.id ?? null
  if (!userId && sessionUser.email) {
    const user = await prisma.user.findUnique({ where: { email: sessionUser.email }, select: { id: true } })
    userId = user?.id ?? null
  }
  if (!userId) return { error: json(401, "Not signed in") }

  const membership = await prisma.institutionMembership.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      userRoles: {
        where: { isActive: true },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      },
    },
  })

  if (!membership) return { error: json(403, "No active institution membership") }

  const roleKeys: string[] = []
  const permissions = new Set<string>()
  for (const ur of membership.userRoles) {
    roleKeys.push(ur.role.key)
    for (const rp of ur.role.permissions) permissions.add(rp.permission.key)
  }

  return { membership: { userId, institutionId: membership.institutionId, roleKeys, permissions } }
}

/** Log a permission denial (audit failure must not mask the denial) */
async function auditDenial(
  membership: MembershipContext,
  required: string
) {
  await prisma.auditEvent
    .create({
      data: {
        actorId: membership.userId,
        action: "READ",
        targetType: "Permission",
        targetName: required,
        institutionId: membership.institutionId,
        metadata: {
          action: "access_denied",
          required,
          userHas: [...membership.permissions],
        },
      },
    })
    .catch(() => {})
}

/** Null when allowed; 401/403 NextResponse otherwise — matches the legacy call-site contract:
 *   const permissionCheck = await requirePermission("portal:staff:read")
 *   if (permissionCheck) return permissionCheck
 */
export async function requirePermission(permission: string, _request?: unknown): Promise<NextResponse | null> {
  const gate = await getMembershipContext()
  if ("error" in gate) return gate.error
  const { membership } = gate
  if (!membership.permissions.has(permission)) {
    await auditDenial(membership, permission)
    return json(403, `Requires permission: ${permission}`)
  }
  return null
}

/** Strict variant returning the membership context, or the error response */
export async function requireAccess(
  permission: string
): Promise<{ membership: MembershipContext } | { error: NextResponse }> {
  const gate = await getMembershipContext()
  if ("error" in gate) return { error: gate.error }
  const { membership } = gate
  if (!membership.permissions.has(permission)) {
    await auditDenial(membership, permission)
    return { error: json(403, `Requires permission: ${permission}`) }
  }
  return { membership }
}

/** Session-only gate (any active member) — for routes where every staff member may act */
export async function requireSession(): Promise<{ membership: MembershipContext } | { error: NextResponse }> {
  const gate = await getMembershipContext()
  if ("error" in gate) return { error: gate.error }
  return { membership: gate.membership }
}

/** Institution id from the caller's ACTIVE membership — ignores client-supplied ids.
 *  Double-hop: requirePermission() already resolved membership; this is a cheap indexed lookup. */
export async function scopedInstitutionId(): Promise<string> {
  const gate = await getMembershipContext()
  if ("error" in gate) return ""
  return gate.membership.institutionId
}
