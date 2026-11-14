import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { getGuardianContext } from "@/server/parent"
import { requireAccess, requirePermission, scopedInstitutionId } from "@/server/rbac"
import type { InvoiceStatus, Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

const billingStatus = (status: InvoiceStatus): "PENDING" | "PAID" | "OVERDUE" =>
  status === "PAID" ? "PAID" : status === "OVERDUE" ? "OVERDUE" : "PENDING"

const lineSelect = {
  feeItem: { select: { id: true, name: true } },
  invoice: {
    include: {
      student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
      term: { select: { name: true, academicYear: { select: { name: true } } } },
      payments: {
        include: { receipt: { select: { receiptNumber: true } } },
        orderBy: { transactionDate: "desc" as const },
      },
    },
  },
} as const

type LineWithRelations = Prisma.InvoiceLineGetPayload<{ include: typeof lineSelect }>

const toDto = (line: LineWithRelations) => {
  const inv = line.invoice
  const latestPayment = inv.payments[0]
  return {
    id: line.id,
    invoiceId: inv.id,
    studentId: inv.student.id,
    studentName: `${inv.student.firstName} ${inv.student.lastName}`.trim(),
    admissionNumber: inv.student.admissionNumber ?? "",
    feeName: line.feeItem.name,
    amount: Math.round(Number(line.lineAmount.toString()) / 100),
    period: inv.term ? `${inv.term.name} ${inv.term.academicYear.name}` : "—",
    dueDate: inv.dueDate.toISOString().slice(0, 10),
    status: billingStatus(inv.status),
    paidDate: latestPayment?.transactionDate.toISOString(),
    paymentMethod: latestPayment?.method,
    receiptNumber: latestPayment?.receipt?.receiptNumber,
  }
}

/** Staff members get the whole institution; guardians get only their own children. */
async function callerScope(): Promise<
  { institutionId: string; studentIds: string[] | null } | { error: NextResponse }
> {
  const guardian = await getGuardianContext()
  if (!("error" in guardian)) {
    const links = await prisma.studentGuardian.findMany({
      where: { guardianId: guardian.guardian.guardianId, institutionId: guardian.guardian.institutionId },
      select: { studentId: true },
    })
    return { institutionId: guardian.guardian.institutionId, studentIds: links.map((l) => l.studentId) }
  }

  const permissionCheck = await requirePermission("portal:staff:read")
  if (permissionCheck) return { error: NextResponse.json({ success: false, error: "Not authorised" }, { status: 403 }) }

  const institutionId = await scopedInstitutionId()
  if (!institutionId) {
    return { error: NextResponse.json({ success: false, error: "No active membership" }, { status: 403 }) }
  }
  return { institutionId, studentIds: null }
}

export async function GET(request: Request) {
  try {
    const scope = await callerScope()
    if ("error" in scope) return scope.error
    const { institutionId, studentIds } = scope
    if (studentIds && studentIds.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")?.trim() ?? ""
    const status = searchParams.get("status")?.toUpperCase() ?? ""
    const search = searchParams.get("search")?.trim().toLowerCase() ?? ""

    const statusWhere =
      status === "PAID"
        ? { status: "PAID" as const }
        : status === "OVERDUE"
          ? { status: "OVERDUE" as const }
          : status === "PENDING"
            ? { status: { in: ["DRAFT", "SENT", "PARTIALLY_PAID"] as InvoiceStatus[] } }
            : {}

    const lines = await prisma.invoiceLine.findMany({
      where: {
        feeItem: { type: "BOARDING" },
        invoice: {
          institutionId,
          ...(studentIds ? { studentId: { in: studentIds } } : {}),
          ...(studentId ? { studentId } : {}),
          ...statusWhere,
        },
      },
      include: lineSelect,
      orderBy: { createdAt: "desc" },
      take: 500,
    })

    const data = lines
      .map(toDto)
      .filter(
        (dto) =>
          !search ||
          dto.studentName.toLowerCase().includes(search) ||
          dto.admissionNumber.toLowerCase().includes(search) ||
          dto.feeName.toLowerCase().includes(search) ||
          (dto.receiptNumber ?? "").toLowerCase().includes(search),
      )
      .slice(0, 200)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Boarding billing GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch boarding billing" }, { status: 500 })
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
    const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount)
    const description = typeof body?.description === "string" ? body.description.trim() : "Boarding fee"
    const dueDate = typeof body?.dueDate === "string" ? body.dueDate : ""

    if (!admissionNumber) {
      return NextResponse.json({ success: false, error: "admissionNumber is required" }, { status: 400 })
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: "amount must be a positive number (KES)" }, { status: 400 })
    }

    let due: Date = new Date(Date.now() + 30 * 86_400_000)
    if (dueDate) {
      const parsed = new Date(dueDate)
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ success: false, error: "dueDate is not a valid date" }, { status: 400 })
      }
      due = parsed
    }

    const student = await prisma.student.findFirst({
      where: { institutionId, admissionNumber },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { institutionId, status: "ACTIVE" },
      include: { terms: { where: { isCurrent: true }, take: 1 } },
      orderBy: { startDate: "desc" },
    })
    if (!academicYear) {
      return NextResponse.json({ success: false, error: "No active academic year is configured" }, { status: 409 })
    }
    const term = academicYear.terms[0] ?? null
    const academicYearId = academicYear.id
    const termId = term?.id ?? null

    const amountCents = Math.round(amount * 100)

    const result = await prisma.$transaction(async (tx) => {
      const structure = await tx.feeStructure.findFirst({
        where: { institutionId, academicYearId, name: "Boarding Fees" },
        select: { id: true },
      })
      const structureId =
        structure?.id ??
        (
          await tx.feeStructure.create({
            data: {
              institutionId,
              academicYearId,
              termId,
              name: "Boarding Fees",
              description: "Boarding fee charges",
              isActive: true,
            },
            select: { id: true },
          })
        ).id

      const feeItem = await tx.feeItem.create({
        data: {
          feeStructureId: structureId,
          name: description,
          type: "BOARDING",
          amount: amountCents,
          isOptional: false,
          isRecurring: true,
        },
        select: { id: true },
      })

      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      const invoice = await tx.invoice.create({
        data: {
          institutionId,
          studentId: student.id,
          termId,
          academicYearId,
          feeStructureId: structureId,
          invoiceNumber,
          issueDate: new Date(),
          dueDate: due,
          subtotal: amountCents,
          totalAmount: amountCents,
          amountRemaining: amountCents,
          status: "SENT",
          lines: {
            create: [
              {
                feeItemId: feeItem.id,
                description,
                quantity: 1,
                unitAmount: amountCents,
                lineAmount: amountCents,
              },
            ],
          },
        },
        select: { id: true, invoiceNumber: true, issueDate: true, dueDate: true, status: true },
      })
      return { invoice, feeItemId: feeItem.id }
    })

    await prisma.auditEvent
      .create({
        data: {
          actorId: membership.userId,
          action: "CREATE",
          targetType: "Invoice",
          targetId: result.invoice.id,
          institutionId,
          metadata: {
            action: "issue_boarding_invoice",
            studentId: student.id,
            amount: amountCents,
            description,
          },
        },
      })
      .catch(() => {})

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.invoice.id,
          invoiceId: result.invoice.id,
          invoiceNumber: result.invoice.invoiceNumber,
          studentId: student.id,
          amount,
          period: term ? `${term.name} ${academicYear.name}` : academicYear.name,
          dueDate: result.invoice.dueDate.toISOString().slice(0, 10),
          status: "PENDING" as const,
        },
        message: "Boarding invoice issued",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Boarding billing POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to issue boarding invoice" }, { status: 500 })
  }
}
