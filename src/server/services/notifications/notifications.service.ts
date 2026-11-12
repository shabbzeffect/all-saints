/* Notifications Service - SaintsHub
 * Staff inbox + admin broadcasts. Own notifications only for read paths;
 * broadcasting requires portal:admin:write and expands to the target audience.
 */

import { Prisma, NotificationType } from "@prisma/client"
import { prisma } from "@/server/db"

const serializeNotification = (n: any) => ({
  id: n.id,
  userId: n.userId,
  title: n.title,
  message: n.message,
  type: n.type,
  read: n.read,
  readAt: n.readAt?.toISOString() ?? null,
  createdAt: n.createdAt.toISOString(),
  sentById: n.sentById,
})

/** My notifications — own inbox only */
export async function listMyNotifications({
  userId,
  unreadOnly = false,
  limit = 50,
}: {
  userId: string
  unreadOnly?: boolean
  limit?: number
}) {
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 200),
  })
  return rows.map(serializeNotification)
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } })
}

/** Mark one of my notifications read */
export async function markNotificationRead({ id, userId }: { id: string; userId: string }) {
  const result = await prisma.notification.updateMany({
    where: { id, userId, read: false },
    data: { read: true, readAt: new Date() },
  })
  if (result.count > 0) {
    const updated = await prisma.notification.findUnique({ where: { id } })
    return updated ? serializeNotification(updated) : null
  }
  const existing = await prisma.notification.findFirst({ where: { id, userId } })
  return existing ? serializeNotification(existing) : null
}

/** Mark all my notifications read */
export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  })
  return { marked: result.count }
}

// ============================================================================
// BROADCAST (admins only, audited)
// ============================================================================

/** Active members with an admin-permission role (portal:admin:write) or all staff */
async function listAudience(institutionId: string, audience: "STAFF" | "ADMINS") {
  if (audience === "ADMINS") {
    const members = await prisma.institutionMembership.findMany({
      where: {
        institutionId,
        status: "ACTIVE",
        userRoles: {
          some: { isActive: true, role: { permissions: { some: { permission: { key: "portal:admin:write" } } } } },
        },
      },
      select: { userId: true },
    })
    return [...new Set(members.map((m) => m.userId))]
  }
  const members = await prisma.institutionMembership.findMany({
    where: { institutionId, status: "ACTIVE" },
    select: { userId: true },
  })
  return [...new Set(members.map((m) => m.userId))]
}

/** Admin broadcast — one notification per recipient (in-app only; email/SMS per-channel is out of scope of this endpoint for blast safety) */
export async function broadcastNotification({
  institutionId,
  actorId,
  audience,
  title,
  message,
}: {
  institutionId: string
  actorId?: string
  audience: "STAFF" | "ADMINS"
  title: string
  message: string
}) {
  const t = title.trim()
  const m = message.trim()
  if (!t || !m) throw new Error("Title and message are required")
  if (t.length > 140) throw new Error("Title must be 140 characters or fewer")

  const recipients = await listAudience(institutionId, audience)
  if (recipients.length === 0) throw new Error("No recipients match that audience")

  await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      institutionId,
      userId,
      sentById: actorId ?? null,
      type: NotificationType.SYSTEM,
      title: t,
      message: m,
      metadata: { action: "broadcast", audience, recipientCount: recipients.length } as Prisma.InputJsonValue,
    })),
  })

  await prisma.auditEvent.create({
    data: {
      actorId: actorId ?? null,
      action: "CREATE",
      targetType: "Notification",
      targetName: `${t.slice(0, 60)} (broadcast to ${audience})`,
      institutionId,
      metadata: { action: "notification_broadcast", audience, recipientCount: recipients.length },
    },
  })

  return { audience, recipientCount: recipients.length }
}
