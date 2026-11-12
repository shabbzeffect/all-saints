/* Notifications API - SaintsHub
 * GET   /api/notifications           -> my inbox (?unread=1&limit=)           [portal:staff:read]
 * GET   /api/notifications?count=1   -> unread count (for badge)              [portal:staff:read]
 * PATCH /api/notifications           -> { id, read: true }                    [owner only]
 * POST /api/notifications            -> { action: "read_all" } |              [owner]
 *                                       { action: "broadcast", audience, title, message }  [admin]
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAccess } from "@/server/rbac"
import {
  listMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
} from "@/server/services/notifications/notifications.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get("count") === "1") {
      const count = await getUnreadCount(membership.userId)
      return NextResponse.json({ success: true, data: { unread: count } })
    }
    const unreadOnly = searchParams.get("unread") === "1"
    const limit = parseInt(searchParams.get("limit") ?? "50", 10) || 50
    const rows = await listMyNotifications({ userId: membership.userId, unreadOnly, limit })
    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error("Notifications list error:", error)
    return NextResponse.json({ success: false, error: "Failed to load notifications" }, { status: 500 })
  }
}

const patchSchema = z.object({ id: z.string().min(1), read: z.literal(true) })

export async function PATCH(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 })
  }

  try {
    const data = await markNotificationRead({ id: body.id, userId: membership.userId })
    if (!data) return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Mark read error:", error)
    return NextResponse.json({ success: false, error: "Failed to mark read" }, { status: 500 })
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read_all") }),
  z.object({
    action: z.literal("broadcast"),
    audience: z.enum(["STAFF", "ADMINS"]),
    title: z.string().min(1, "Title is required").max(140),
    message: z.string().min(1, "Message is required").max(2000),
  }),
])

export async function POST(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate
  const isAdmin = membership.permissions.has("portal:admin:write")

  let body: z.infer<typeof postSchema>
  try {
    body = postSchema.parse(await request.json())
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.issues?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  if (body.action === "read_all") {
    try {
      const data = await markAllNotificationsRead(membership.userId)
      return NextResponse.json({ success: true, data, message: "All notifications marked read" })
    } catch (error: any) {
      console.error("Mark all read error:", error)
      return NextResponse.json({ success: false, error: "Failed to mark notifications read" }, { status: 500 })
    }
  }

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Requires admin rights" }, { status: 403 })
  }

  try {
    const data = await broadcastNotification({
      institutionId: membership.institutionId,
      actorId: membership.userId,
      audience: body.audience,
      title: body.title,
      message: body.message,
    })
    return NextResponse.json({
      success: true,
      data,
      message: `Broadcast sent to ${data.recipientCount} recipient${data.recipientCount === 1 ? "" : "s"}`,
    })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to broadcast"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
