import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { getGuardianContext } from "@/server/parent"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const gate = await getGuardianContext()
    if ("error" in gate) return gate.error
    const { guardianId, institutionId } = gate.guardian

    const links = await prisma.studentGuardian.findMany({
      where: { guardianId, institutionId },
      select: { studentId: true },
    })
    const studentIds = links.map((l) => l.studentId)
    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, data: { invoices: [] } })
    }

    const invoices = await prisma.invoice.findMany({
      where: { studentId: { in: studentIds }, amountRemaining: { gt: 0 } },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { dueDate: "asc" },
      take: 100,
    })

    const data = invoices.map((inv) => ({
      id: inv.id,
      studentId: inv.studentId,
      studentName: `${inv.student.firstName} ${inv.student.lastName}`.trim(),
      description: `Invoice ${inv.invoiceNumber}`,
      amount: Math.round(Number(inv.amountRemaining) / 100),
      dueDate: inv.dueDate.toISOString().slice(0, 10),
      status: "OUTSTANDING" as const,
    }))

    return NextResponse.json({ success: true, data: { invoices: data } })
  } catch (error) {
    console.error("Parent invoices GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to load invoices" }, { status: 500 })
  }
}
