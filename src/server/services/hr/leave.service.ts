/* Leave Service - SaintsHub HR
 * Leave types, requests, approvals and per-staff balances.
 * APPROVED unpaid leave (isPaid=false) is what payroll's proration reads.
 * Types self-seed on first use (idempotent).
 */

import { prisma } from "@/server/db"
import { sendEmail, createNotification } from "@/server/auth/auth"
import { sendSMSOTP } from "@/server/integrations/sms"

// ============================================================================
// NOTIFICATIONS (best-effort — never block the mutation)
// ============================================================================

const shortDate = (d: Date) => d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })

async function notifyUser({
  userId,
  sentById,
  institutionId,
  title,
  message,
  email,
  phone,
}: {
  userId: string
  sentById?: string | null
  institutionId: string
  title: string
  message: string
  email?: string | null
  phone?: string | null
}) {
  try {
    await createNotification({
      userId,
      sentById: sentById ?? undefined,
      institutionId,
      type: "ACADEMIC",
      title,
      message,
    })
  } catch (e) {
    console.error("in-app leave notification failed:", e)
  }
  try {
    if (email) {
      await sendEmail({ to: email, subject: title, html: `<p>${message}</p>`, text: message })
    }
  } catch (e) {
    console.error("email leave notification failed:", e)
  }
  try {
    if (phone) {
      await sendSMSOTP({ phone, message: title.slice(0, 140) })
    }
  } catch (e) {
    console.error("sms leave notification failed:", e)
  }
}

/** All staff user ids in the institution who hold portal:admin:write */
async function listAdminRecipients(institutionId: string) {
  const members = await prisma.institutionMembership.findMany({
    where: {
      institutionId,
      status: "ACTIVE",
      userRoles: {
        some: {
          isActive: true,
          role: { permissions: { some: { permission: { key: "portal:admin:write" } } } },
        },
      },
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  })
  if (members.length === 0) return []
  const phones = await prisma.staff.findMany({
    where: { institutionId, userId: { in: members.map((m) => m.userId) } },
    select: { userId: true, phone: true },
  })
  const phoneByUser = new Map(phones.map((p) => [p.userId, p.phone]))
  return members.map((m) => ({ ...m, phone: phoneByUser.get(m.userId) ?? null }))
}

async function notifyAdmins(
  institutionId: string,
  sentById: string | null | undefined,
  title: string,
  message: string
) {
  const admins = await listAdminRecipients(institutionId)
  await Promise.all(
    admins.map((a) =>
      notifyUser({
        userId: a.userId,
        sentById,
        institutionId,
        title,
        message,
        email: a.user?.email ?? null,
        phone: a.phone,
      })
    )
  )
}

const DEFAULT_LEAVE_TYPES = [
  { key: "ANNUAL", name: "Annual Leave", daysPerYear: 21, isPaid: true, requiresApproval: true },
  { key: "SICK", name: "Sick Leave", daysPerYear: 7, isPaid: true, requiresApproval: false },
  { key: "MATERNITY", name: "Maternity Leave", daysPerYear: 90, isPaid: true, requiresApproval: true },
  { key: "PATERNITY", name: "Paternity Leave", daysPerYear: 14, isPaid: true, requiresApproval: true },
  { key: "COMPASSIONATE", name: "Compassionate Leave", daysPerYear: 5, isPaid: true, requiresApproval: true },
  { key: "STUDY", name: "Study Leave", daysPerYear: 10, isPaid: true, requiresApproval: true },
  { key: "MARRIAGE", name: "Marriage Leave", daysPerYear: 3, isPaid: true, requiresApproval: true },
  { key: "UNPAID", name: "Unpaid Leave", daysPerYear: 30, isPaid: false, requiresApproval: true },
]

/** Create the default leave types for an institution if it has none (atomic, idempotent) */
export async function ensureLeaveTypes(institutionId: string) {
  const existing = await prisma.leaveType.count({ where: { institutionId } })
  if (existing === 0) {
    try {
      await prisma.leaveType.createMany({
        data: DEFAULT_LEAVE_TYPES.map((lt) => ({ ...lt, institutionId })),
        skipDuplicates: true,
      })
    } catch {
      // Another request seeded concurrently — the default types are idempotent
      const recheck = await prisma.leaveType.count({ where: { institutionId } })
      if (recheck === 0) throw new Error("Failed to seed leave types")
    }
  }
  // Annual leave carries up to 5 days into the next year by default (admin-tunable)
  await prisma.leaveType.updateMany({
    where: { institutionId, key: "ANNUAL", carryOverCap: 0 },
    data: { carryOverCap: 5 },
  })
}

const requestInclude = {
  leaveType: { select: { key: true, name: true, isPaid: true, daysPerYear: true } },
  staff: {
    include: {
      user: { select: { name: true, email: true } },
      role: { select: { name: true } },
    },
  },
} as const

const serialize = (r: any) => ({
  id: r.id,
  staffId: r.staffId,
  staffName: r.staff.user?.name ?? "Staff",
  staffRole: r.staff.role?.name ?? null,
  leaveType: { key: r.leaveType.key, name: r.leaveType.name, isPaid: r.leaveType.isPaid },
  startDate: r.startDate.toISOString(),
  endDate: r.endDate.toISOString(),
  daysRequested: r.daysRequested,
  status: r.status,
  reason: r.reason,
  createdAt: r.createdAt.toISOString(),
})

export async function listLeaveTypes(institutionId: string) {
  await ensureLeaveTypes(institutionId)
  return prisma.leaveType.findMany({
    where: { institutionId },
    orderBy: { key: "asc" },
  })
}

export async function listLeaveRequests({
  institutionId,
  staffId,
  status,
}: {
  institutionId: string
  staffId?: string
  status?: string
}) {
  await ensureLeaveTypes(institutionId)
  const requests = await prisma.leaveRequest.findMany({
    where: {
      staff: { institutionId },
      ...(staffId ? { staffId } : {}),
      ...(status ? { status } : {}),
    },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return requests.map(serialize)
}

const daysInclusive = (start: Date, end: Date) =>
  Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1

export async function createLeaveRequest({
  institutionId,
  userId,
  leaveTypeId,
  startDate,
  endDate,
  daysRequested,
  reason,
}: {
  institutionId: string
  userId: string
  leaveTypeId: string
  startDate: Date
  endDate: Date
  daysRequested?: number
  reason?: string
}) {
  const staff = await prisma.staff.findFirst({
    where: { institutionId, userId },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!staff) throw new Error("You are not provisioned as staff")

  const type = await prisma.leaveType.findFirst({ where: { id: leaveTypeId, institutionId } })
  if (!type) throw new Error("Leave type not found")

  if (!(startDate <= endDate)) throw new Error("Start date must be on or before end date")
  const span = daysInclusive(startDate, endDate)
  if (span > 365) throw new Error("Leave window cannot exceed one year")
  const days = Math.min(daysRequested ?? span, span)
  if (!(days >= 0.5)) throw new Error("Request at least half a day")

  const request = await prisma.leaveRequest.create({
    data: {
      staffId: staff.id,
      leaveTypeId: type.id,
      startDate,
      endDate,
      daysRequested: days,
      reason: reason?.trim() || null,
      status: "PENDING",
    },
    include: requestInclude,
  })

  await prisma.auditEvent.create({
    data: {
      actorId: userId,
      action: "CREATE",
      targetType: "LeaveRequest",
      targetName: `${type.name} — ${staff.user?.name ?? staff.id}`,
      institutionId,
      metadata: { action: "leave_request_created", leaveRequestId: request.id, daysRequested: days },
    },
  })

  const title = `Leave request pending — ${staff.user?.name ?? "Staff"} (${type.name})`
  const message = `${staff.user?.name ?? "A staff member"} requested ${days} day${days === 1 ? "" : "s"} of ${type.name} (${shortDate(startDate)} – ${shortDate(endDate)}).${reason ? `\nReason: ${reason.trim()}` : ""}`
  await notifyAdmins(institutionId, userId, title, message)

  return serialize(request)
}

interface BalanceType {
  id: string
  key: string
  name: string
  daysPerYear: number
  isPaid: boolean
  carryOverCap: number
}

/** Own balances per leave type, including adjustments and carry-over from last year */
export async function getMyLeaveBalances({
  institutionId,
  userId,
  year = new Date().getFullYear(),
}: {
  institutionId: string
  userId: string
  year?: number
}) {
  const staff = await prisma.staff.findFirst({
    where: { institutionId, userId },
    select: { id: true },
  })
  if (!staff) return null

  const types = (await listLeaveTypes(institutionId)) as BalanceType[]
  const yearStart = new Date(Date.UTC(year - 2, 0, 1))
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59))

  const [requests, adjustments] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: {
        staffId: staff.id,
        createdAt: { gte: yearStart, lte: yearEnd },
        status: { in: ["APPROVED", "PENDING"] },
      },
      select: { leaveTypeId: true, daysRequested: true, status: true, createdAt: true },
    }),
    prisma.leaveBalanceAdjustment.findMany({
      where: { staffId: staff.id, year: { in: [year - 1, year] } },
      select: { leaveTypeId: true, year: true, delta: true },
    }),
  ])

  const usedIn = (typeId: string, y: number, status: "APPROVED" | "PENDING") =>
    requests
      .filter((r) => r.leaveTypeId === typeId && r.status === status && r.createdAt.getUTCFullYear() === y)
      .reduce((sum, r) => sum + r.daysRequested, 0)
  const adjustmentIn = (typeId: string, y: number) =>
    adjustments
      .filter((a) => a.leaveTypeId === typeId && a.year === y)
      .reduce((sum, a) => sum + a.delta, 0)

  return types.map((t) => {
    const usedPrev = usedIn(t.id, year - 1, "APPROVED") + usedIn(t.id, year - 1, "PENDING")
    const adjPrev = adjustmentIn(t.id, year - 1)
    // Carry-over depends only on last year's adjusted remaining (documented one-year lookback)
    const carried =
      t.carryOverCap > 0 ? Math.min(Math.max(0, t.daysPerYear + adjPrev - usedPrev), t.carryOverCap) : 0
    const adjustment = adjustmentIn(t.id, year)
    const used = usedIn(t.id, year, "APPROVED")
    const pending = usedIn(t.id, year, "PENDING")
    const adjusted = t.daysPerYear + adjustment + carried
    return {
      id: t.id,
      key: t.key,
      name: t.name,
      daysPerYear: t.daysPerYear,
      isPaid: t.isPaid,
      carryOverCap: t.carryOverCap,
      adjustment,
      carried,
      adjusted,
      used,
      pending,
      remaining: Math.max(0, adjusted - used - pending),
    }
  })
}

/** Overview for the leave page: own balances, own history, or (for admins) institution queue */
export async function getLeaveOverview({
  institutionId,
  userId,
  isAdmin,
}: {
  institutionId: string
  userId: string
  isAdmin: boolean
}) {
  const staff = await prisma.staff.findFirst({
    where: { institutionId, userId },
    select: { id: true },
  })

  const [balances, mine, pending] = await Promise.all([
    staff ? getMyLeaveBalances({ institutionId, userId }) : Promise.resolve([]),
    staff
      ? prisma.leaveRequest.findMany({
          where: { staff: { id: staff.id } },
          include: requestInclude,
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : Promise.resolve([]),
    isAdmin
      ? prisma.leaveRequest.findMany({
          where: { staff: { institutionId }, status: "PENDING" },
          include: requestInclude,
          orderBy: { createdAt: "asc" },
          take: 50,
        })
      : Promise.resolve([]),
  ])

  return {
    balances,
    requests: mine.map(serialize),
    pendingApprovals: pending.map(serialize),
  }
}

export async function updateLeaveRequestStatus({
  institutionId,
  userId,
  requestId,
  action,
  actorId,
  isAdmin,
}: {
  institutionId: string
  userId?: string
  requestId: string
  action: "approve" | "reject" | "cancel"
  actorId?: string
  isAdmin: boolean
}) {
  const request = await prisma.leaveRequest.findFirst({
    where: { id: requestId, staff: { institutionId } },
    include: {
      staff: { include: { user: { select: { name: true, email: true } } } },
      leaveType: { select: { name: true, isPaid: true } },
    },
  })
  if (!request) throw new Error("Leave request not found")

  const requesterUserId = request.staff.userId
  const requesterPhone = request.staff.phone ?? null
  const requesterEmail = request.staff.user?.email ?? null
  const requesterName = request.staff.user?.name ?? "Staff"
  const typeName = request.leaveType.name
  const dateRange = `${shortDate(request.startDate)} – ${shortDate(request.endDate)}`

  if (action === "cancel") {
    const isOwner = userId && requesterUserId === userId
    if (!isOwner && !isAdmin) throw new Error("You can only cancel your own leave request")
    if (request.status !== "PENDING" && !isAdmin) {
      throw new Error("Only pending requests can be cancelled")
    }
    const updated = await prisma.leaveRequest.update({
      where: { id: request.id },
      data: { status: "CANCELLED", approvedBy: actorId ?? null, approvedAt: new Date() },
      include: requestInclude,
    })
    await prisma.auditEvent.create({
      data: {
        actorId: actorId ?? null,
        action: "UPDATE",
        targetType: "LeaveRequest",
        targetName: `${typeName} — ${requesterName}`,
        institutionId,
        metadata: { action: "leave_request_cancelled", leaveRequestId: updated.id },
      },
    })

    const title = `Leave cancelled — ${typeName}`
    if (isOwner) {
      await notifyAdmins(
        institutionId,
        actorId,
        title,
        `${requesterName} cancelled their ${typeName} request (${dateRange}).`
      )
    } else {
      await notifyUser({
        userId: requesterUserId,
        sentById: actorId,
        institutionId,
        title,
        message: `${requesterName}, an admin cancelled your ${typeName} leave (${dateRange}). Please contact HR if this is unexpected.`,
        email: requesterEmail,
        phone: requesterPhone,
      })
    }
    return serialize(updated)
  }

  if (!isAdmin) throw new Error("Approving leave requires admin rights")
  if (request.status !== "PENDING") {
    throw new Error(`Cannot ${action} a ${request.status} request`)
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: request.id },
    data:
      action === "approve"
        ? { status: "APPROVED", approvedBy: actorId ?? null, approvedAt: new Date() }
        : { status: "REJECTED", approvedBy: actorId ?? null, approvedAt: new Date() },
    include: requestInclude,
  })
  await prisma.auditEvent.create({
    data: {
      actorId: actorId ?? null,
      action: "UPDATE",
      targetType: "LeaveRequest",
      targetName: `${typeName} — ${requesterName}`,
      institutionId,
      metadata: { action: `leave_request_${action}d`, leaveRequestId: updated.id },
    },
  })

  const approved = action === "approve"
  await notifyUser({
    userId: requesterUserId,
    sentById: actorId,
    institutionId,
    title: approved ? `Leave approved — ${typeName}` : `Leave declined — ${typeName}`,
    message: approved
      ? `${requesterName}, your ${typeName} leave (${dateRange}) has been approved.`
      : `${requesterName}, your ${typeName} leave request (${dateRange}) was declined. Please see HR if you need more detail.`,
    email: requesterEmail,
    phone: requesterPhone,
  })
  return serialize(updated)
}

// ============================================================================
// BALANCE ADJUSTMENTS
// ============================================================================

const adjustmentInclude = {
  staff: { include: { user: { select: { name: true, email: true } } } },
  leaveType: { select: { key: true, name: true } },
} as const

const serializeAdjustment = (a: any) => ({
  id: a.id,
  staffId: a.staffId,
  staffName: a.staff.user?.name ?? "Staff",
  leaveType: { key: a.leaveType.key, name: a.leaveType.name },
  year: a.year,
  delta: a.delta,
  reason: a.reason,
  createdAt: a.createdAt.toISOString(),
})

export async function listLeaveAdjustments({
  institutionId,
  userId,
  staffId,
  year,
  isAdmin,
}: {
  institutionId: string
  userId?: string
  staffId?: string
  year?: number
  isAdmin: boolean
}) {
  const where: any = { institutionId }
  if (!isAdmin) {
    // Non-admins see only their own adjustments
    const own = userId ? await prisma.staff.findFirst({ where: { institutionId, userId }, select: { id: true } }) : null
    where.staffId = own?.id ?? "none"
  } else if (staffId) {
    where.staffId = staffId
  }
  if (year) where.year = year

  const rows = await prisma.leaveBalanceAdjustment.findMany({
    where,
    include: adjustmentInclude,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  })
  return rows.map(serializeAdjustment)
}

export async function createLeaveAdjustment({
  institutionId,
  actorId,
  staffId,
  leaveTypeId,
  year,
  delta,
  reason,
}: {
  institutionId: string
  actorId?: string
  staffId: string
  leaveTypeId: string
  year: number
  delta: number
  reason: string
}) {
  if (!(year >= 2000 && year <= 2100)) throw new Error("Invalid year")
  if (!Number.isFinite(delta) || delta === 0) throw new Error("Delta must be a non-zero number")
  if (Math.abs(delta) > 200) throw new Error("Adjustment is unreasonably large")
  if (!reason.trim()) throw new Error("Reason is required")

  const [staff, type] = await Promise.all([
    prisma.staff.findFirst({
      where: { id: staffId, institutionId },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.leaveType.findFirst({ where: { id: leaveTypeId, institutionId } }),
  ])
  if (!staff) throw new Error("Staff member not found in this institution")
  if (!type) throw new Error("Leave type not found")

  const adjustment = await prisma.leaveBalanceAdjustment.create({
    data: {
      institutionId,
      staffId,
      leaveTypeId,
      year,
      delta,
      reason: reason.trim(),
      createdById: actorId ?? null,
    },
    include: adjustmentInclude,
  })

  await prisma.auditEvent.create({
    data: {
      actorId: actorId ?? null,
      action: "CREATE",
      targetType: "LeaveBalanceAdjustment",
      targetName: `${type.name} ${delta > 0 ? "+" : ""}${delta}d � ${staff.user?.name ?? staffId}`,
      institutionId,
      metadata: { action: "leave_adjustment_created", adjustmentId: adjustment.id, year, delta },
    },
  })

  const direction = delta > 0 ? "credited" : "debited"
  await notifyUser({
    userId: staff.userId,
    sentById: actorId,
    institutionId,
    title: `Leave balance adjusted � ${type.name}`,
    message: `${staff.user?.name ?? "Staff"}, your ${type.name} balance was ${direction} ${Math.abs(delta)} day${Math.abs(delta) === 1 ? "" : "s"} for ${year}.\nReason: ${reason.trim()}`,
    email: staff.user?.email ?? null,
    phone: staff.phone ?? null,
  })

  return serializeAdjustment(adjustment)
}

export async function deleteLeaveAdjustment({
  institutionId,
  actorId,
  adjustmentId,
}: {
  institutionId: string
  actorId?: string
  adjustmentId: string
}) {
  const adjustment = await prisma.leaveBalanceAdjustment.findFirst({
    where: { id: adjustmentId, institutionId },
    include: { staff: { include: { user: { select: { name: true } } } }, leaveType: { select: { name: true } } },
  })
  if (!adjustment) throw new Error("Adjustment not found")

  await prisma.$transaction(async (tx) => {
    await tx.leaveBalanceAdjustment.delete({ where: { id: adjustment.id } })
    await tx.auditEvent.create({
      data: {
        actorId: actorId ?? null,
        action: "DELETE",
        targetType: "LeaveBalanceAdjustment",
        targetName: `${adjustment.leaveType.name} ${adjustment.delta > 0 ? "+" : ""}${adjustment.delta}d � ${adjustment.staff.user?.name ?? adjustment.staffId}`,
        institutionId,
        metadata: { action: "leave_adjustment_deleted", adjustmentId: adjustment.id, year: adjustment.year, delta: adjustment.delta },
      },
    })
  })
  return { id: adjustment.id }
}

/** Admin: update a leave type (currently only carryOverCap is editable) */
export async function updateLeaveType({
  institutionId,
  actorId,
  leaveTypeId,
  carryOverCap,
}: {
  institutionId: string
  actorId?: string
  leaveTypeId: string
  carryOverCap: number
}) {
  if (!(carryOverCap >= 0 && carryOverCap <= 60)) throw new Error("Carry-over cap must be between 0 and 60 days")

  const type = await prisma.leaveType.findFirst({ where: { id: leaveTypeId, institutionId } })
  if (!type) throw new Error("Leave type not found")

  const updated = await prisma.leaveType.update({
    where: { id: type.id },
    data: { carryOverCap },
  })

  await prisma.auditEvent.create({
    data: {
      actorId: actorId ?? null,
      action: "UPDATE",
      targetType: "LeaveType",
      targetName: updated.name,
      institutionId,
      metadata: { action: "leave_type_carry_over_updated", leaveTypeId: updated.id, carryOverCap },
    },
  })

  return { id: updated.id, key: updated.key, name: updated.name, carryOverCap: updated.carryOverCap }
}
