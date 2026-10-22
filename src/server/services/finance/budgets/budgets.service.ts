/* Budgets Service - SaintsHub School Finance
Handles: Budget creation, line items, income vs expenditure tracking
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification } from "../notification.service"

// ============================================================================
// BUDGET CRUD
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
 * Get all budgets for an institution
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
        include: {
          account: {
            select: { code: true, name: true, type: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return budgets
}

/**
 * Add a budget line item
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

/**
 * Get budget summary (income vs expenditure)
 */
export async function getBudgetSummary({
  institutionId,
  fiscalYear,
}: {
  institutionId: string
  fiscalYear: string
}) {
  // Get budget for the fiscal year
  const budget = await prisma.budget.findFirst({
    where: {
      institutionId,
      fiscalYear,
    },
    include {
      budgetLines: true,
    },
  })

  if (!budget) {
    return {
      budget: null,
      totalPlanned: 0,
      totalSpent: 0,
      remaining: 0,
      byCategory: {},
    }
  }

  // Calculate spent from payments
  const payments = await prisma.payment.findMany({
    where: {
      institutionId,
      transactionDate: {
        gte: budget.startDate,
        lte: budget.endDate,
      },
    },
    _sum: { amount: true },
  })

  const totalPlanned = budget.budgetLines.reduce((sum, line) => sum + line.amount, 0)
  const totalSpent = payments._sum.amount || 0
  const remaining = totalPlanned - totalSpent

  // Group by category (account type)
  const byCategory: Record<string, { planned: number; spent: number }> = {}
  budget.budgetLines.forEach((line) => {
    const accountType = line.account?.type || "unknown"
    if (!byCategory[accountType]) {
      byCategory[accountType] = { planned: 0, spent: 0 }
    }
    byCategory[accountType].planned += line.amount
  })

  // Calculate spent per category from payments
  // This is a simplified calculation - in production would link payments to accounts
  payments._sum.amount > 0 && (byCategory["REVENUE"] = byCategory["REVENUE"] || { planned: 0, spent: 0 })
  byCategory["REVENUE"] = byCategory["REVENUE"] || { planned: 0, spent: 0 }
  byCategory["REVENUE"].spent = Math.round(payments._sum.amount / 100) // Convert from cents

  return {
    budget,
    totalPlanned: Number(totalPlanned.toFixed(2)),
    totalSpent: Number(totalSpent.toFixed(2)),
    remaining: Number(remaining.toFixed(2)),
    byCategory,
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Budget,
  BudgetLine,
  BudgetSummary
}