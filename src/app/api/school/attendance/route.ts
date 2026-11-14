import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, requireAccess, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

const STATUSES = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"])

export async function GET(request: Request) {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") ?? undefined
    const status = searchParams.get("status") ?? undefined
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 200))

    const records = await prisma.attendance.findMany({
      where: {
        institutionId,
        ...(studentId ? { studentId } : {}),
        ...(status && STATUSES.has(status) ? { status } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            grade: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    })

    const list = records.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: `${r.student.firstName} ${r.student.lastName ?? ""}`.trim(),
      admissionNumber: r.student.admissionNumber ?? "",
      grade: r.student.grade?.name ?? "(unassigned)",
      date: r.date.toISOString().slice(0, 10),
      status: r.status,
    }))

    const summary = {
      totalDays: list.length,
      presentDays: list.filter((r) => r.status === "PRESENT").length,
      absentDays: list.filter((r) => r.status === "ABSENT").length,
      lateDays: list.filter((r) => r.status === "LATE").length,
      excusedDays: list.filter((r) => r.status === "EXCUSED").length,
    }

    return NextResponse.json({ success: true, data: { records: list, summary } })
  } catch (error) {
    console.error("School attendance GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireAccess("portal:staff:write")
    if ("error" in gate) return gate.error
    const { membership } = gate
    const institutionId = membership.institutionId

    const body = await request.json().catch(() => null)
    const studentRef = typeof body?.studentId === "string" ? body.studentId.trim() : ""
    const dateStr = typeof body?.date === "string" ? body.date : ""
    const status = typeof body?.status === "string" ? body.status.toUpperCase() : ""

    if (!studentRef) {
      return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 })
    }
    if (!dateStr || Number.isNaN(Date.parse(dateStr))) {
      return NextResponse.json({ success: false, error: "A valid date is required" }, { status: 400 })
    }
    if (!STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "status must be PRESENT, ABSENT, LATE or EXCUSED" }, { status: 400 })
    }

    const student = await prisma.student.findFirst({
      where: {
        institutionId,
        OR: [{ id: studentRef }, { admissionNumber: studentRef }],
      },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
    }

    const date = new Date(dateStr)
    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    const existing = await prisma.attendance.findFirst({
      where: { institutionId, studentId: student.id, date: { gte: dayStart, lt: dayEnd } },
    })

    const record = existing
      ? await prisma.attendance.update({ where: { id: existing.id }, data: { status } })
      : await prisma.attendance.create({
          data: { institutionId, studentId: student.id, date: dayStart, status },
        })

    await prisma.auditEvent.create({
      data: {
        actorId: membership.userId,
        action: existing ? "UPDATE" : "CREATE",
        targetType: "Attendance",
        targetId: record.id,
        institutionId,
        metadata: { action: "mark_attendance", studentId: student.id, status, date: dayStart.toISOString().slice(0, 10) },
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, data: { id: record.id, date: dayStart.toISOString().slice(0, 10), status } })
  } catch (error) {
    console.error("School attendance POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to record attendance" }, { status: 500 })
  }
}
