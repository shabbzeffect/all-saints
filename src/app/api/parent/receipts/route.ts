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
      return NextResponse.json({ success: true, data: { receipts: [] } })
    }

    const payments = await prisma.payment.findMany({
      where: { studentId: { in: studentIds }, receipt: { isNot: null } },
      include: {
        receipt: true,
        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
      },
      orderBy: { transactionDate: "desc" },
      take: 100,
    })

    const receipts = payments.map((p) => ({
      id: p.receipt!.id,
      receiptNumber: p.receipt!.receiptNumber,
      amount: Math.round(Number(p.amount) / 100),
      paymentMethod: p.method,
      issueDate: p.receipt!.issuedDate.toISOString(),
      studentName: `${p.student.firstName} ${p.student.lastName}`.trim(),
      admissionNumber: p.student.admissionNumber ?? "",
    }))

    return NextResponse.json({ success: true, data: { receipts } })
  } catch (error) {
    console.error("Parent receipts GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch receipts" }, { status: 500 })
  }
}
