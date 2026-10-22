/* Invoices Service - SaintsHub School Finance
Handles: Invoice generation, payment recording, status tracking
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, parseCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// INVOICE GENERATION
// ============================================================================

/**
 * Generate invoice for a student (full workflow)
 */
export async function generateInvoiceWorkflow({
  data,
  institutionId,
  createdById,
}: {
  data: {
    studentId: string
    termId: string
    academicYearId: string
    feeStructureId: string
    issueDate?: Date
    dueDate?: Date
    applyDiscounts?: boolean
    discountAmount?: number
    discountType?: DiscountType
  },
  institutionId: string
  createdById: string
}) {
  // Validate all entities exist
  const student = await prisma.student.findUnique({
    where: { id: data.studentId, institutionId },
  })

  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: data.feeStructureId, institutionId },
  })

  const term = await prisma.term.findUnique({
    where: { id: data.termId, institutionId },
  })

  if (!student || !feeStructure || !term) {
    throw new Error("Student, fee structure, or term not found")
  }

  // Get mandatory fee items
  const feeItems = await prisma.feeItem.findMany({
    where: { institutionId, isMandatory: true },
  })

  // Calculate subtotal from fee items
  let subtotal = 0
  const lines: any[] = []

  for (const item of feeItems) {
    lines.push({
      feeItemId: item.id,
      description: item.name,
      amount: item.amount,
      quantity: 1,
    })
    subtotal += item.amount
  }

  // Apply discounts
  let discountAmount = 0
  let discountType: DiscountType = DiscountType.NONE

  if (data.applyDiscounts && data.discountAmount !== undefined) {
    discountAmount = Math.round(parseFloat(data.discountAmount.toString()) * 100)
    discountType = data.discountType || DiscountType.PERCENTAGE
  }

  const totalAmount = Math.max(0, subtotal - discountAmount)
  const totalRemaining = totalAmount

  // Set dates
  const issueDate = data.issueDate || new Date()
  const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 6)
    .toUpperCase()}`

  const invoice = await prisma.invoice.create({
    data: {
      institutionId,
      studentId: data.studentId,
      termId: data.termId,
      academicYearId: data.academicYearId,
      feeStructureId: data.feeStructureId,
      invoiceNumber,
      issueDate,
      dueDate,
      subtotal,
      discountAmount,
      discountType,
      totalAmount,
      amountRemaining: totalRemaining,
      status: InvoiceStatus.DRAFT,
      lines,
    },
    include {
      student: {
        include: { grade: true },
      },
      lines: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Invoice",
      targetId: invoice.id,
      institutionId,
      metadata: {
        action: "generate_invoice",
        student: student.firstName,
        class: student.grade?.name,
        totalAmount: totalAmount,
        discount: discountAmount,
      },
    },
  })

  // Create background job for SMS/Email reminders
  await createBackgroundJob({
    type: JobType.SEND_SMS,
    payload: {
      type: "invoice_generated",
      institutionId,
      studentId: data.studentId,
      invoiceNumber,
    },
    institutionId,
    correlationId: `invoice_${invoice.id}`,
  })

  return {
    invoice,
    subtotal,
    discountAmount,
    totalAmount,
    totalRemaining,
    lines,
    message: "Invoice generated successfully",
  }
}

/**
 * Get invoices with filtering and pagination
 */
export async function getInvoices({
  institutionId,
  filters = {},
  pagination = { page: 1, limit: 20 },
}: {
  institutionId: string
  filters?: { studentId?: string; status?: string; termId?: string }
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const where: any = {
    institutionId,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status }),
    ...(filters.termId && { termId: filters.termId }),
  }

  const [invoices, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      include {
        student: {
          include: { grade: true },
        },
        lines: {
          include: { feeItem: true },
        },
        payments: {
          orderBy: { transactionDate: "desc" },
          take: 5, // Last 5 payments
        },
      },
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
    }),
    prisma.invoice.count({ where }),
  ])

  return {
    invoices,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Record a payment against an invoice
 */
export async function recordPayment({
  invoiceId,
  institutionId,
  paymentData,
  processedById,
}: {
  invoiceId: string
  institutionId: string
  paymentData: {
    amount: number
    paymentMethod: PaymentMethod
    reference: string
    transactionId?: string
  }
  processedById: string
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, institutionId },
    include { lines: true, student: true },
  })

  if (!invoice) {
    throw new Error("Invoice not found")
  }

  const amount = Math.round(parseFloat(paymentData.amount.toString()) * 100)

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      institutionId,
      invoiceId,
      studentId: invoice.studentId,
      amount,
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference,
      transactionId: paymentData.transactionId,
      status: "SUCCESS",
      processedBy: processedById,
    },
    include {
      student: true,
      invoice: true,
    },
  })

  // Update invoice payment tracking
  const newAmountPaid = (invoice.amountPaid || 0) + amount
  const newAmountRemaining = Math.max(0, (invoice.totalAmount || 0) - newAmountPaid)
  let newStatus: InvoiceStatus = InvoiceStatus.SENT

  if (newAmountRemaining <= 0) {
    newStatus = InvoiceStatus.FULLY_PAID
  } else if (newAmountRemaining < (invoice.totalAmount || 0)) {
    newStatus = InvoiceStatus.PARTIALLY_PAID
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId, institutionId },
    data: {
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      status: newStatus,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: processedById,
      action: AuditAction.CREATE,
      targetType: "Payment",
      targetId: payment.id,
      institutionId,
      metadata: {
        action: "record_payment",
        invoiceNumber: invoice.invoiceNumber,
        amount: amount,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        remaining: newAmountRemaining,
        status: newStatus,
      },
    },
  })

  // If invoice fully paid, generate receipt automatically
  if (newStatus === InvoiceStatus.FULLY_PAID) {
    await createReceiptAuto({
      paymentId: payment.id,
      institutionId,
      amount,
      processedById,
    })
  }

  // Create notification for defaulter alerts
  if (newStatus === InvoiceStatus.OVERDUE) {
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.SMS,
      subject: "Fee Payment Overdue - All Saints Mushililie Academy",
      body: `Invoice ${invoice.invoiceNumber} for ${invoice.student?.firstName} is overdue. Amount remaining: KSh ${(newAmountRemaining / 100).toLocaleString()}`.replace("KSh ", ""),
      templateId: "defaulter_alert",
      priority: 2,
    })
  }

  return {
    payment,
    invoice: updatedInvoice,
  }
}

/**
 * Auto-create receipt for fully paid invoice
 */
async function createReceiptAuto({
  paymentId,
  institutionId,
  amount,
  processedById,
}: {
  paymentId: string
  institutionId: string
  amount: number
  processedById: string
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, institutionId },
    include { invoice: true, student: true },
  })

  if (!payment || !payment.invoice) {
    return
  }

  const receiptNumber = `RCPT-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 6)
    .toUpperCase()}`

  const receipt = await prisma.receipt.create({
    data: {
      institutionId,
      paymentId,
      receiptNumber,
      amount,
      paymentMethod: payment.paymentMethod,
      issueDate: new Date(),
      status: "ISSUED",
    },
    include {
      payment: true,
      student: {
        include: { grade: true },
      },
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: processedById,
      action: AuditAction.CREATE,
      targetType: "Receipt",
      targetId: receipt.id,
      institutionId,
      metadata: {
        action: "auto_receipt_issue",
        payment: payment.id,
        invoice: payment.invoice.invoiceNumber,
        amount: amount,
      },
    },
  })

  return receipt
}

/**
 * Generate defaulters list for a term
 */
export async function generateDefaultersList({
  institutionId,
  termId,
}: {
  institutionId: string
  termId: string
}) {
  // Get all invoices for the term not fully paid
  const invoices = await prisma.invoice.findMany({
    where: {
      institutionId,
      termId,
      status: {
        ne: InvoiceStatus.FULLY_PAID,
        ne: InvoiceStatus.WRITTEN_OFF,
      },
    },
    include {
      student: {
        include: { grade: true },
      },
    },
    orderBy: { amountRemaining: "desc" },
  })

  const defaulters = invoices.map((invoice) => ({
    studentId: invoice.studentId,
    admissionNumber: invoice.student?.admissionNumber || "",
    fullName: `${invoice.student?.firstName || ""} ${invoice.student?.lastName || ""}`,
    grade: invoice.student?.grade?.name || "",
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid || 0,
    amountRemaining: invoice.amountRemaining,
    dueDate: invoice.dueDate,
    status: invoice.status,
  }))

  const totalOutstanding = defaulters.reduce(
    (sum, d) => sum + d.amountRemaining,
    0
  )

  return {
    termId,
    totalInvoices: invoices.length,
    totalOutstanding: Number(totalOutstanding.toFixed(2)),
    defaulters,
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Invoice,
  InvoiceLine,
  Payment,
  Receipt,
  DiscountType,
  InvoiceStatus,
  PaymentMethod
}