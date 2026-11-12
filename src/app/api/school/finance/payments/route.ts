import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/server/db"
import { requireAccess, requirePermission, scopedInstitutionId } from "@/server/rbac"

const centsToKes = (v: unknown) => Number(v ?? 0) / 100

const recordPaymentSchema = z.object({
  admissionNumber: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "MPESA", "BANK_TRANSFER", "CHEQUE", "CARD", "WALLET", "ONLINE", "IN_KIND"]),
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
    const search = (searchParams.get("search") || "").trim()
    const method = searchParams.get("method") || ""
    const VALID_METHODS = ["CASH", "MPESA", "BANK_TRANSFER", "CHEQUE", "CARD", "WALLET", "ONLINE", "IN_KIND"]
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 500)

    const where: Record<string, unknown> = { institutionId }
    if (VALID_METHODS.includes(method)) where.method = method
    if (search) {
      where.OR = [
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        { student: { admissionNumber: { contains: search, mode: "insensitive" } } },
        { reference: { contains: search, mode: "insensitive" } },
      ]
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
        receipt: { select: { receiptNumber: true } },
      },
      orderBy: { transactionDate: "desc" },
      take: limit,
    })

    const data = payments.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      admissionNumber: p.student.admissionNumber,
      studentName: `${p.student.firstName} ${p.student.lastName}`,
      amount: centsToKes(p.amount),
      paymentMethod: p.method,
      paymentDate: p.transactionDate.toISOString(),
      receiptNumber: p.receipt?.receiptNumber ?? "",
      status: "COMPLETED" as const,
      notes: p.notes,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("School finance payments GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireAccess("portal:staff:write")
    if ("error" in gate) return gate.error
    const { membership } = gate

    const body = await request.json()
    const parsed = recordPaymentSchema.safeParse({
      admissionNumber: String(body.admissionNumber ?? "").trim(),
      amount: typeof body.amount === "string" ? Number(body.amount) : body.amount,
      paymentMethod: body.paymentMethod,
    })
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "admissionNumber, a positive amount and paymentMethod are required" }, { status: 400 })
    }
    const { admissionNumber, amount, paymentMethod } = parsed.data

    const institutionId = membership.institutionId
    const student = await prisma.student.findUnique({
      where: { admissionNumber },
      select: { id: true, institutionId: true, firstName: true, lastName: true, admissionNumber: true },
    })
    if (!student || student.institutionId !== institutionId) {
      return NextResponse.json({ success: false, error: `No student with admission number ${admissionNumber}` }, { status: 404 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: { institutionId, studentId: student.id },
      orderBy: [{ amountRemaining: "desc" }, { issueDate: "asc" }],
      select: { id: true, amountRemaining: true },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: "No invoice found for this student" }, { status: 400 })
    }

    const cents = Math.round(amount * 100)
    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296)
      .toString(36)
      .toUpperCase()
      .padStart(2, "0")}`

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          institutionId,
          invoiceId: invoice.id,
          studentId: student.id,
          amount: String(cents),
          method: paymentMethod,
          reference: receiptNumber,
          transactionDate: new Date(),
          recordedById: membership.userId,
          notes: "Recorded via portal",
        },
      })
      const newRemaining = Number(invoice.amountRemaining) - cents
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountRemaining: String(newRemaining),
          status: newRemaining <= 0 ? "PAID" : "PARTIALLY_PAID",
        },
      })
      const receipt = await tx.receipt.create({
        data: {
          institutionId,
          paymentId: payment.id,
          receiptNumber,
          issuedDate: new Date(),
          issuedById: membership.userId,
        },
      })
      return { payment, receipt }
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.payment.id,
          receiptNumber: result.receipt.receiptNumber,
          admissionNumber: student.admissionNumber,
          studentName: `${student.firstName} ${student.lastName}`,
          amount,
          paymentMethod,
          paymentDate: result.payment.transactionDate.toISOString(),
        },
        message: "Payment recorded",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("School finance payments POST error:", error)
    return NextResponse.json({ success: false, error: "Could not record payment" }, { status: 500 })
  }
}
