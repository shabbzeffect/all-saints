import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const passes = await prisma.exeatPass.findMany({
      where: { student: { institutionId } },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true, grade: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    const data = passes.map((p) => ({
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
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Pending exeat passes GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch pending exeat passes" }, { status: 500 })
  }
}
