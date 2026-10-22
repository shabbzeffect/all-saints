// ============================================================================
// Authorization Middleware - SaintsHub
// ============================================================================
// Provides: withAuth, requirePermission, requireInstitution, optionalAuth
// Enforces: RBAC with institution scoping, resource-level permissions
// ============================================================================

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth, getCurrentUser, hasActiveInstitution, Wing } from "./auth"
import { prisma } from "./db"
import { AuditAction } from "@prisma/client"
import { increment } from "@prisma/client/runtime/library"

// ============================================================================
// Middleware Types
// ============================================================================

type MiddlewareConfig = {
  /** Required wing (SCHOOL | PARISH | SHARED) */
  requiredWing?: Wing
  /** Required permission key, e.g., "school:finance:read" */
  requiredPermission?: string
  /** Allow access if user has ANY of these permissions */
  anyOfPermissions?: string[]
  /** Redirect unauthenticated users to /auth/login */
  loginRedirect?: string
  /** Also check if user is active */
  requireActive: boolean
}

// ============================================================================
// withAuth
// Wraps a handler to ensure user is authenticated
// and has the required wing/institution context
// ============================================================================

export async function withAuth<
  T extends { (req: NextRequest): Promise<Response> }
>(
  handler: T,
  config: MiddlewareConfig = {}
): T {
  return async (request: NextRequest) => {
    // 1. Check authentication
    const session = await auth()

    if (!session || !session.user) {
      const loginRedirect = config.loginRedirect || "/auth/login"
      const url = new URL(loginRedirect, request.url)

      // Preserve original URL as redirect target
      url.searchParams.set("redirect", request.url)

      return NextResponse.redirect(url)
    }

    const user = session.user

    // 2. Check if user has active institution membership
    const institutionInfo = await hasActiveInstitution(user.id)

    if (!institutionInfo && config.requireActive !== false) {
      // User not linked to any institution - show onboarding
      if (config.requiredWing) {
        // Redirect to institution selection
        return NextResponse.redirect(
          new URL(`/auth/onboarding?wing=${config.requiredWing}`, request.url)
        )
      }
      // No institution - show selection
      return NextResponse.redirect(
        new URL("/auth/onboarding", request.url)
      )
    }

    // 3. Check wing requirement
    if (config.requiredWing && institutionInfo?.wing !== config.requiredWing) {
      return NextResponse.redirect(
        new URL(
          `/auth/onboarding?wing=${config.requiredWing}&redirect=${encodeURIComponent(
            request.url
          )}`,
          request.url
        )
      )
    }

    // 4. Check institution requirement
    if (config.requiredWing && !institutionInfo) {
      return NextResponse.redirect(
        new URL("/auth/onboarding", request.url)
      )
    }

    // 5. Attach institution info to request for handler use
    // We'll store it in a way the handler can access
    // For now, pass via the user object extensions
    ;(request as any)._user = {
      ...user,
      institutionId: institutionInfo?.institutionId,
      wing: institutionInfo?.wing,
      role: institutionInfo?.role,
    }

    // 6. Proceed to handler
    const result = await handler(request)

    return result
  }
}

// ============================================================================
// requirePermission
// Checks if the authenticated user has the required permission
// for the given resource and action. Must be used inside a withAuth handler.
// ============================================================================

export async function requirePermission(
  request: NextRequest,
  requiredPerm: string,
  handler: () => Promise<Response>,
  config: { anyOf?: string[] } = {}
): Promise<Response> {
  const user = (request as any)._user

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { institutionId, wing, role } = user

  // If wing is specified and doesn't match, deny
  if (config.anyOf) {
    // Check if user has ANY of the specified permissions
    // We need to check the permissions from their role(s)
    const userPermissions = await getUserPermissions(user)

    const hasPerm = config.anyOf.some((perm) => userPermissions.includes(perm))

    if (!hasPerm) {
      // Audit permission denial
      await logAuditEvent({
        actorId: user.id,
        action: AuditAction.READ,
        targetType: "Permission",
        metadata: {
          required: requiredPerm,
          userHas: userPermissions,
        },
      })

      return new NextResponse(
        "Insufficient permissions. Required: " + requiredPerm,
        { status: 403 }
      )
    }
  } else {
    // Single permission check
    const userPermissions = await getUserPermissions(user)

    if (!userPermissions.includes(requiredPerm)) {
      // Audit permission denial
      await logAuditEvent({
        actorId: user.id,
        action: AuditAction.READ,
        targetType: "Permission",
        metadata: {
          required: requiredPerm,
          userHas: userPermissions,
        },
      })

      return new NextResponse(
        "Insufficient permissions. Required: " + requiredPerm,
        { status: 403 }
        // In production, you might want to redirect rather than show error
      )
    }
  }

  // Permission granted - proceed to handler
  return await handler()
}

// ============================================================================
// getUserPermissions
// Retrieves all effective permissions for a user based on their roles
// ============================================================================

async function getUserPermissions(user: any): Promise<string[]> {
  const permissions: Set<string> = new Set()

  if (!user.roles) return []

  for (const role of user.roles) {
    // Get role's permissions from DB
    if (role.permissions) {
      for (const perm of role.permissions) {
        if (perm.isSystem || perm.action) {
          const key = `${perm.resource}:${perm.action}`
          permissions.add(key)
        }
      }
    }
  }

  // Also check for GLOBAL permissions
  // If user has a global permission, it applies everywhere
  // This is handled at the Prisma/RQL level, not here

  return Array.from(permissions)
}

// ============================================================================
// requireInstitution
// Ensures the request is scoped to the correct institution.
// Used for school vs parish separation.
// ============================================================================

export async function requireInstitution(
  request: NextRequest,
  allowedWings: Wing[] = [Wing.SCHOOL, Wing.PARISH]
): Promise<boolean> {
  const user = (request as any)._user

  if (!user || !user.institutionId) {
    return false
  }

  // Check if user's institution wing is in the allowed list
  if (!allowedWings.includes(user.wing as Wing)) {
    return false
  }

  // Optionally verify the institution ID matches what's in the request
  // e.g., for school routes, institutionId should match school's institutionId

  return true
}

// ============================================================================
// optionalAuth
// Like withAuth but doesn't redirect if not authenticated.
// Useful for public pages that have both school and parish content.
// =============================================

export async function optionalAuth(
  handler: (request: NextRequest, user?: any) => Promise<Response>
): Promise<Response> {
  const session = await auth()

  if (session && session.user) {
    ;(request as any)._user = {
      ...session.user,
      institutionId: session.user.institutionId,
      wing: session.user.wing,
      role: session.user.role,
    }
  }

  return handler(request, session?.user)
}

// ============================================================================
// Audit Event Logging
// ============================================================================

async function logAuditEvent({
  actorId,
  action,
  targetType,
  targetId,
  institutionId,
  metadata,
}: {
  actorId: string
  action: AuditAction
  targetType?: string
  targetId?: string
  institutionId?: string
  metadata?: any
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        institutionId,
        metadata: metadata || {},
        createdAt: new Date(),
      },
    })
  } catch (error) {
    // Don't throw - audit logging failure shouldn't break the app
    console.error("Audit log failed:", error)
  }
}

// ============================================================================
// Rate Limiting Middleware (basic)
// ============================================================================

export async function withRateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
) {
  // Simple IP-based rate limiting
  // In production, use Redis for distributed rate limiting

  const ip = request.ip ?? "unknown"
  const now = Date.now()

  // This is a placeholder - implement with Redis in production
  // const key = `rate_limit:${ip}`
  // const count = await redis.get(key)
  // if (count && parseInt(count) >= limit) {
  //   return new NextResponse("Too many requests", { status: 406 })
  // }
  // await redis.incr(key)
  // await expire(key, windowMs / 1000)

  // For now, allow all requests
  return null
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type { MiddlewareConfig, Wing }
export {
  withAuth,
  requirePermission,
  requireInstitution,
  optionalAuth,
  logAuditEvent,
  getUserPermissions,
  Wing,
  AuditAction,
}