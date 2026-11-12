import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"

const centsToKes = (v: unknown) => Number(v ?? 0) / 100

export async function GET() {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const [feeStructures, invoiceStats, collectedStats, overdueStats] = await Promise.all([
      prisma.feeStructure.findMany({
        where: { institutionId },
        include: {
          grade: { select: { name: true } },
          feeItems: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.invoice.aggregate({
        where: { institutionId },
        _sum: { totalAmount: true, amountRemaining: true },
      }),
      prisma.payment.aggregate({
        where: { institutionId },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { institutionId, amountRemaining: { gt: 0 } },
        _sum: { amountRemaining: true },
        _count: true,
      }),
    ])

    const feeStructure = feeStructures.flatMap((fs) =>
      fs.feeItems.map((item) => ({
        id: item.id,
        name: fs.name,
        description: fs.description ?? item.name,
        amount: centsToKes(item.amount),
        frequency: "ANNUAL" as const,
        isMandatory: true,
        applicableGrades: fs.grade ? [fs.grade.name] : [],
        itemType: item.type,
      }))
    )

    const stats = {
      invoiced: centsToKes(invoiceStats._sum.totalAmount),
      collected: centsToKes(collectedStats._sum.amount),
      outstanding: centsToKes(overdueStats._sum.amountRemaining),
      remainingNet: centsToKes(invoiceStats._sum.amountRemaining),
      overdueStudents: overdueStats._count,
    }

    return NextResponse.json({ success: true, data: { feeStructure, stats } })
  } catch (error) {
    console.error("School finance GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch fee structures" }, { status: 500 })
  }
}
