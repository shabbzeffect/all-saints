/* Reports Service - SaintsHub School Finance
Handles: Financial reports, income/expenditure statements, defaulters lists
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

/**
 * Generate income & expenditure statement
 */
export async function generateIncomeExpenditureStatement({
  institutionId,
  startDate,
  endDate,
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
        gte: startDate,
        lte: endDate,
      },
    },
    include { invoice: true, student: true },
  })

  // Get all bank transactions
  const bankTransactions = await prisma.bankTransaction.findMany({
    where: {
      institutionId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // Calculate totals
  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalBankTransactionsCount = bankTransactions.length

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
      start: startDate.toLocaleDateString("en-KE"),
      end: endDate.toLocaleDateString("en-KE"),
    },
    totalIncome: Number((totalIncome / 100).toFixed(2)), // Convert from cents to KES
    totalBankTransactions: totalBankTransactionsCount,
    byMethod: Object.fromEntries(
      Object.entries(byMethod).map(([k, v]) => [k, Number((v / 100).toFixed(2))])
    ),
    byMonth: Object.fromEntries(
      Object.entries(byMonth).map(
        ([k, v]) => [k, { income: Number((v.income / 100).toFixed(2)), count: v.count }]
      )
    ),
    totalTransactions: payments.length,
  }
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
    totalAmount: Number((invoice.totalAmount / 100).toFixed(2)),
    amountPaid: Number((invoice.amountPaid / 100).toFixed(2)),
    amountRemaining: Number((invoice.amountRemaining / 100).toFixed(2)),
    dueDate: invoice.dueDate?.toLocaleDateString("en-KE"),
    status: invoice.status,
  }))

  const totalOutstanding = defaulters.reduce(
    (sum, d) => sum + d.amountRemaining,
    0
  )

  return {
    termId,
    totalInvoices: invoices.length,
    totalOutstanding: Number((totalOutstanding / 100).toFixed(2)),
    defaulters,
  }
}

/**
 * Generate fee summary by grade
 */
export async function generateFeeSummaryByGrade({
  institutionId,
  termId,
}: {
  institutionId: string
  termId: string
}) {
  // Get all students in the institution
  const students = await prisma.student.findMany({
    where: { institutionId, status: "ACTIVE" },
    include { grade: true },
  })

  // Get all invoices for the term
  const invoices = await prisma.invoice.findMany({
    where: {
      institutionId,
      termId,
    },
    include {
      student: {
        include: { grade: true },
      },
    },
  })

  // Build summary per grade
  const gradeSummary = students.map((student) => {
    const studentInvoices = invoices.filter(
      (inv) => inv.studentId === student.id
    )

    const totalInvoices = studentInvoices.length
    const totalPaid = studentInvoices.reduce(
      (sum, inv) => sum + (inv.amountPaid || 0),
      0
    )
    const totalOutstanding = studentInvoices.reduce(
      (sum, inv) => sum + (inv.amountRemaining || 0),
      0
    )

    return {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      fullName: `${student.firstName} ${student.lastName || ""}`,
      grade: student.grade?.name,
      totalInvoices,
      totalPaid: Number((totalPaid / 100).toFixed(2)),
      totalOutstanding: Number((totalOutstanding / 100).toFixed(2)),
      paymentRate: totalInvoices > 0 ? Number((totalPaid / (totalInvoices * invoice.totalAmount || 1)) * 100).toFixed(2) : "0.00",
    }
  })

  return {
    termId,
    totalStudents: students.length,
    gradeSummary,
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  IncomeExpenditureStatement,
  DefaultersList,
  FeeSummaryByGrade
}