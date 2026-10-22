/* Fee Structure Service - SaintsHub School Finance
Handles: Fee structure creation, grade-level fees, optional items, discounts
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, parseCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"

// ============================================================================
// FEE STRUCTURE CRUD
// ============================================================================

/**
 * Create a new fee structure
 */
export async function createFeeStructure({
  data,
  institutionId,
  createdById,
}: {
  data: {
    name: string
    description?: string
    currency?: string
  },
  institutionId: string
  createdById: string
}) {
  // Check for duplicate name
  const existing = await prisma.feeStructure.findFirst({
    where: { name: data.name, institutionId },
  })

  if (existing) {
    throw new Error("A fee structure with this name already exists")
  }

  const feeStructure = await prisma.feeStructure.create({
    data: {
      ...data,
      institutionId,
    },
    include: {
      feeItems: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "FeeStructure",
      targetId: feeStructure.id,
      institutionId,
      metadata: {
        action: "create_fee_structure",
        name: data.name,
      },
    },
  })

  return feeStructure
}

/**
 * Get all fee structures for an institution
 */
export async function getFeeStructures({
  institutionId,
  activeOnly = true,
}: {
  institutionId: string
  activeOnly?: boolean
}) {
  const where = activeOnly
    ? { institutionId, isActive: true }
    : { institutionId }

  const structures = await prisma.feeStructure.findMany({
    where,
    include: {
      feeItems: {
        orderBy: { type: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return structures
}

/**
 * Get a fee structure by ID
 */
export async function getFeeStructureById({
  structureId,
  institutionId,
}: {
  structureId: string
  institutionId: string
}) {
  const structure = await prisma.feeStructure.findUnique({
    where: { id: structureId, institutionId },
    include: {
      feeItems: {
        orderBy: { type: "asc" },
      },
    },
  })

  if (!structure) {
    throw new Error("Fee structure not found")
  }

  return structure
}

/**
 * Update a fee structure
 */
export async function updateFeeStructure({
  structureId,
  institutionId,
  data,
  updatedById,
}: {
  structureId: string
  institutionId: string
  data: { name?: string; description?: string; isActive?: boolean }
  updatedById: string
}) {
  // Check for duplicate name if renaming
  if (data.name) {
    const existing = await prisma.feeStructure.findFirst({
      where: {
        name: data.name,
        institutionId,
        NOT: { id: structureId },
      },
    })

    if (existing) {
      throw new Error("Another fee structure with this name already exists")
    }
  }

  const updated = await prisma.feeStructure.update({
    where: { id: structureId, institutionId },
    data,
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: updatedById,
      action: AuditAction.UPDATE,
      targetType: "FeeStructure",
      targetId: structureId,
      institutionId,
      metadata: {
        action: "update_fee_structure",
        updatedFields: Object.keys(data),
      },
    },
  })

  return updated
}

/**
 * Create a fee item
 */
export async function createFeeItem({
  data,
  institutionId,
  createdById,
}: {
  data: {
    name: string
    type: FeeType
    description?: string
    amount: number // In minor units (cents)
    isMandatory?: boolean
    optionalItems?: string
  },
  institutionId: string
  createdById: string
}) {
  // Check for duplicate name within structure
  const existing = await prisma.feeItem.findFirst({
    where: { name: data.name, institutionId },
  })

  if (existing) {
    throw new Error("A fee item with this name already exists")
  }

  const feeItem = await prisma.feeItem.create({
    data: {
      ...data,
      institutionId,
      amount: Math.round(parseFloat(data.amount.toString()) * 100), // Convert to cents
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "FeeItem",
      targetId: feeItem.id,
      institutionId,
      metadata: {
        action: "create_fee_item",
        name: data.name,
        type: data.type,
        amount: data.amount,
      },
    },
  })

  return feeItem
}

/**
 * Get fee items for a structure
 */
export async function getFeeItems({
  institutionId,
  feeStructureId,
  type,
}: {
  institutionId: string
  feeStructureId?: string
  type?: FeeType
}) {
  const where: any = { institutionId }

  if (feeStructureId) {
    where.feeStructureId = feeStructureId
  }

  if (type) {
    where.type = type
  }

  const items = await prisma.feeItem.findMany({
    where,
    orderBy: { type: "asc", name: "asc" },
  })

  return items
}

// ============================================================================
// INVOICE GENERATION
// ============================================================================

/**
 * Generate an invoice for a student
 */
export async function generateInvoice({
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
  // Validate student exists
  const student = await prisma.student.findUnique({
    where: { id: data.studentId, institutionId },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  // Validate fee structure
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: data.feeStructureId, institutionId },
  })

  if (!feeStructure) {
    throw new Error("Fee structure not found")
  }

  // Validate term
  const term = await prisma.term.findUnique({
    where: { id: data.termId, institutionId },
  })

  if (!term) {
    throw new Error("Term not found")
  }

  // Calculate invoice line items
  const feeItems = await prisma.feeItem.findMany({
    where: { institutionId, isMandatory: true },
  })

  // Calculate subtotal
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

  // Apply discounts if requested
  let discountAmount = 0
  let discountType: DiscountType = DiscountType.NONE

  if (data.applyDiscounts && data.discountAmount) {
    discountAmount = Math.round(parseFloat(data.discountAmount.toString()) * 100)
    discountType = data.discountType || DiscountType.PERCENTAGE
  }

  // Calculate total
  const totalAmount = subtotal - discountAmount

  // Set dates
  const issueDate = data.issueDate || new Date()
  const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 6)
    .toUpperCase()}`
  const totalRemaining = totalAmount

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
      notes: data.notes,
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
        feeStructure: feeStructure.name,
        totalAmount: totalAmount,
        discount: discountAmount,
      },
    },
  })

  return {
    invoice,
    subtotal,
    discountAmount,
    totalAmount,
    totalRemaining,
    lines,
  }
}

/**
 * Get invoices with filtering
 */
export async function getInvoices({
  institutionId,
  filters = {},
  pagination = { page: 1, limit: 20 },
}: {
  institutionId: string
  filters?: { studentId?: string; status?: InvoiceStatus; termId?: string }
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
      include: {
        student: {
          include: { grade: true },
        },
        lines: {
          include: { feeItem: true },
        },
        payments: {
          orderBy: { transactionDate: "desc" },
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
 * Update invoice status and payment recording
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
    include: { lines: true, student: true },
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
    include: {
      student: true,
      invoice: true,
    },
  })

  // Update invoice payment status
  const newAmountPaid = (invoice.amountPaid || 0) + amount
  const newAmountRemaining = (invoice.totalAmount || 0) - newAmountPaid
  let newStatus: InvoiceStatus = InvoiceStatus.SENT

  if (newAmountRemaining <= 0) {
    newStatus = InvoiceStatus.FULLY_PAID
  } else if (newAmountRemaining < invoice.subtotal) {
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
        invoice: invoice.invoiceNumber,
        amount: amount,
        method: paymentData.paymentMethod,
        remaining: newAmountRemaining,
        status: newStatus,
      },
    },
  })

  // If invoice fully paid, generate receipt
  if (newStatus === InvoiceStatus.FULLY_PAID) {
    await createReceipt({
      paymentId: payment.id,
      institutionId,
      amount,
      receiptNumber: `RCPT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`,
      processedById,
    })
  }

  return {
    payment,
    invoice: updatedInvoice,
  }
}

/**
 * Create a receipt for a payment
 */
export async function createReceipt({
  paymentId,
  institutionId,
  amount,
  receiptNumber,
  issuedById,
}: {
  paymentId: string
  institutionId: string
  amount: number
  receiptNumber: string
  issuedById: string
}) {
  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, institutionId },
    include: { invoice: true, student: true },
  })

  if (!payment) {
    throw new Error("Payment not found")
  }

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
    include: {
      payment: true,
      student: {
        include: { grade: true },
      },
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: issuedById,
      action: AuditAction.CREATE,
      targetType: "Receipt",
      targetId: receipt.id,
      institutionId,
      metadata: {
        action: "create_receipt",
        payment: payment.id,
        amount: amount,
        method: payment.paymentMethod,
      },
    },
  })

  // Update payment receipt status
  await prisma.payment.update({
    where: { id: paymentId, institutionId },
    data: { status: "SUCCESS" }, // Ensure status is set
  })

  return receipt
}

/**
 * Get receipt by ID
 */
export async function getReceiptById({
  receiptId,
  institutionId,
}: {
  receiptId: string
  institutionId: string
}) {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId, institutionId },
    include: {
      payment: true,
      student: {
        include: { grade: true },
      },
    },
  })

  if (!receipt) {
    throw new Error("Receipt not found")
  }

  return receipt
}

// ============================================================================
// BUDGETS
// ============================================================================

/**
 * Create a budget
 */
export async function createBudget({
  data,
  institutionId,
  createdById,
}: {
  data: {
    name: string
    fiscalYear: string
    startDate: Date
    endDate: Date
    description?: string
  },
  institutionId: string
  createdById: string
}) {
  const budget = await prisma.budget.create({
    data: {
      ...data,
      institutionId,
    },
    include {
      budgetLines: true,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "Budget",
      targetId: budget.id,
      institutionId,
      metadata: {
        action: "create_budget",
        name: data.name,
        fiscalYear: data.fiscalYear,
      },
    },
  })

  return budget
}

/**
 * Get budgets for an institution
 */
export async function getBudgets({
  institutionId,
  status,
}: {
  institutionId: string
  status?: string
}) {
  const where = status ? { institutionId, status } : { institutionId }

  const budgets = await prisma.budget.findMany({
    where,
    include {
      budgetLines: {
        include: { account: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return budgets
}

/**
 * Add a budget line
 */
export async function addBudgetLine({
  data,
  institutionId,
  createdById,
}: {
  data: {
    budgetId: string
    accountId: string
    amount: number
    period: "MONTHLY" | "QUARTERLY" | "ANNUALLY"
    periodIndex: number
    notes?: string
  },
  institutionId: string
  createdById: string
}) {
  const budgetLine = await prisma.budgetLine.create({
    data: {
      ...data,
      institutionId,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "BudgetLine",
      targetId: budgetLine.id,
      institutionId,
      metadata: {
        action: "add_budget_line",
        budgetId: data.budgetId,
        amount: data.amount,
        period: data.period,
      },
    },
  })

  return budgetLine
}

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

/**
 * Generate income & expenditure statement
 */
export async function generateIncomeExpenditureStatement({
  institutionId,
  startDate: start,
  endDate: end,
}: {
  institutionId: string
  startDate: Date
  endDate: Date
}) {
  // Get all payments within date range
  const payments = await prisma.payment.findMany({
    where: {
      institutionId,
      transactionDate: {
        gte: start,
        lte: end,
      },
    },
    include: { invoice: true, student: true },
  })

  // Get all bank transactions
  const bankTransactions = await prisma.bankTransaction.findMany({
    where: {
      institutionId,
      transactionDate: {
        gte: start,
        lte: end,
      },
    },
  })

  // Calculate totals
  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenditure = 0 // Would need expense records
  const netPosition = totalIncome

  // Group by payment method
  const byMethod: Record<string, number> = {}
  payments.forEach((p) => {
    const method = p.paymentMethod
    byMethod[method] = (byMethod[method] || 0) + p.amount
  })

  // Group by month
  const byMonth: Record<string, { income: number; count: number }> = {}
  payments.forEach((p) => {
    const month = p.transactionDate.toLocaleString("en-KE", { month: "short" })
    if (!byMonth[month]) {
      byMonth[month] = { income: 0, count: 0 }
    }
    byMonth[month].income += p.amount
    byMonth[month].count++
  })

  return {
    period: {
      start: start.toLocaleDateString("en-KE"),
      end: end.toLocaleDateString("en-KE"),
    },
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenditure: 0, // Placeholder - would need expense model
    netPosition: Number(netPosition.toFixed(2)),
    byMethod,
    byMonth,
    totalTransactions: payments.length,
    totalBankTransactions: bankTransactions.length,
  }
}

/**
 * Generate defaulters list
 */
export async function generateDefaultersList({
  institutionId,
  termId: term,
}: {
  institutionId: string
  termId: string
}) {
  // Get all active students
  const students = await prisma.student.findMany({
    where: { institutionId, status: "ACTIVE" },
    include: { enrolments: { include: { term: true } } },
  })

  // Get invoices for the term that are not fully paid
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
  })

  // Build defaulters list
  const defaulters = invoices.map((invoice) => {
    const student = invoice.student
    const remaining = invoice.amountRemaining

    return {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      fullName: `${student.firstName} ${student.lastName || ""}`,
      grade: student.grade?.name,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      amountPaid: invoice.amountPaid || 0,
      amountRemaining: remaining,
      dueDate: invoice.dueDate,
      status: invoice.status,
    }
  })

  // Sort by remaining amount (highest first)
  defaulters.sort((a, b) => b.amountRemaining - a.amountRemaining)

  return {
    termId: term,
    totalStudents: students.length,
    totalInvoices: invoices.length,
    defaulters,
    totalOutstanding: defaulters.reduce((sum, d) => sum + d.amountRemaining, 0),
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  FeeStructure,
  FeeItem,
  Invoice,
  InvoiceLine,
  Payment,
  Receipt,
  BankTransaction,
  Budget,
  BudgetLine,
  DiscountType,
  InvoiceStatus,
  PaymentMethod,
  FeeType
}