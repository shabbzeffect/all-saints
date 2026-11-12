// Students API - list enrolled learners for the portal.
// Only GET is implemented; it is the only consumer (students page).
import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

const centsToKes = (v: unknown) => Number(v ?? 0) / 100

export async function GET(request: Request) {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || "").trim()
    const status = (searchParams.get("status") || "").trim().toUpperCase()
    const grade = (searchParams.get("grade") || "").trim().toUpperCase()
    const withdrawn = searchParams.get("withdrawn") === "true"

    const where: Record<string, unknown> = { institutionId }
    if (status && ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED", "WITHDRAWN", "ON_LEAVE"].includes(status)) {
      where.status = status
    }
    if (grade) where.grade = { name: grade }
    if (withdrawn) where.status = "WITHDRAWN"
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { admissionNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        grade: { select: { name: true } },
        invoices: {
          where: { amountRemaining: { gt: 0 } },
          select: { amountRemaining: true },
        },
      },
      orderBy: [{ grade: { name: "asc" } }, { lastName: "asc" }],
      take: 1000,
    })

    const data = students.map((s) => {
      const outstanding = s.invoices.reduce((sum, inv) => sum + Number(inv.amountRemaining), 0)
      return {
        id: s.id,
        admissionNumber: s.admissionNumber ?? "",
        firstName: s.firstName,
        lastName: s.lastName,
        fullName: `${s.firstName} ${s.lastName}`,
        grade: s.grade?.name ?? "—",
        class: s.grade?.name ?? "—",
        status: s.status.toLowerCase(),
        isBoarding: false,
        feesOutstanding: Math.round(centsToKes(outstanding) * 100) / 100,
      }
    })

    return NextResponse.json({ success: true, students: data, total: data.length })
  } catch (error) {
    console.error("Students API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 })
  }
}
