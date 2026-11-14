import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, requireAccess, scopedInstitutionId } from "@/server/rbac"
import type { ExeatStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const EX_EAT_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED", "EXPIRED"])

const toDto = (p: {
  id: string
  studentId: string
  requestedBy: string
  reason: string
  startDate: Date
  endDate: Date
  status: ExeatStatus
  approvedBy: string | null
  approvedAt: Date | null
  createdAt: Date
  student: { firstName: string; lastName: string; admissionNumber: string | null; grade: { name: string } | null }
}) => ({
  id: p.id,
  studentId: p.studentId,
  requestedBy: p.requestedBy,
  reason: p.reason,
  startDate: p.startDate.toISOString().slice(0, 10),
  endDate: p.endDate.toISOString().slice(0, 10),
  status: p.status,
  approvedBy: p.approvedBy,
  approvedAt: p.approvedAt?.toISOString() ?? null,
  createdAt: p.createdAt.toISOString(),
  studentName: `${p.student.firstName} ${p.student.lastName}`.trim(),
  admissionNumber: p.student.admissionNumber ?? "",
  grade: p.student.grade?.name ?? "(unassigned)",
  daysRequested: Math.max(1, Math.round((p.endDate.getTime() - p.startDate.getTime()) / 86_400_000) + 1),
})

export async function GET(request: Request) {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const studentId = searchParams.get("studentId") ?? undefined
    const search = searchParams.get("search")?.trim() ?? ""

    const passes = await prisma.exeatPass.findMany({
      where: {
        student: { institutionId },
        ...(status && EX_EAT_STATUSES.has(status) ? { status: status as ExeatStatus } : {}),
        ...(studentId ? { studentId } : {}),
        ...(search
          ? {
              OR: [
                { reason: { contains: search, mode: "insensitive" } },
                { student: { firstName: { contains: search, mode: "insensitive" } } },
                { student: { lastName: { contains: search, mode: "insensitive" } } },
                { student: { admissionNumber: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true, grade: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return NextResponse.json({ success: true, data: passes.map(toDto) })
  } catch (error) {
    console.error("Boarding exeat passes GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exeat passes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireAccess("portal:staff:write")
    if ("error" in gate) return gate.error
    const { membership } = gate
    const institutionId = membership.institutionId

    const body = await request.json().catch(() => null)
    const admissionNumber = typeof body?.admissionNumber === "string" ? body.admissionNumber.trim() : ""
    const reason = typeof body?.reason === "string" ? body.reason.trim() : ""
    const startDate = typeof body?.startDate === "string" ? body.startDate : ""
    const endDate = typeof body?.endDate === "string" ? body.endDate : ""

    if (!admissionNumber) {
      return NextResponse.json({ success: false, error: "admissionNumber is required" }, { status: 400 })
    }
    if (!reason) {
      return NextResponse.json({ success: false, error: "reason is required" }, { status: 400 })
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!startDate || Number.isNaN(start.getTime()) || !endDate || Number.isNaN(end.getTime())) {
      return NextResponse.json({ success: false, error: "A valid startDate and endDate are required" }, { status: 400 })
    }
    if (end < start) {
      return NextResponse.json({ success: false, error: "endDate cannot be before startDate" }, { status: 400 })
    }

    const student = await prisma.student.findFirst({
      where: { institutionId, admissionNumber },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
    }

    const pass = await prisma.exeatPass.create({
      data: {
        studentId: student.id,
        requestedBy: membership.userId,
        reason,
        startDate: start,
        endDate: end,
        status: "PENDING",
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true, grade: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json({ success: true, data: toDto(pass), message: "Exeat pass created" }, { status: 201 })
  } catch (error) {
    console.error("Boarding exeat passes POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create exeat pass" }, { status: 500 })
  }
}
