/* Receipts Service - SaintsHub School Finance
Handles: Receipt generation, QR codes, receipt history, acknowledgment tracking
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency } from "@/lib/config"
import { createNotification } from "../notification.service"

// ============================================================================
// RECEIPT GENERATION
// ============================================================================

/**
 * Get receipt by ID
 */
export async function getReceipt({
  receiptId,
  institutionId,
}: {
  receiptId: string
  institutionId: string
}) {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId, institutionId },
    include {
      payment: true,
      student: {
        include: { grade: true, user: true },
      },
    },
  })

  if (!receipt) {
    throw new Error("Receipt not found")
  }

  return receipt
}

/**
 * Get receipt history for a student
 */
export async function getReceiptHistory({
  studentId,
  institutionId,
  pagination = { page: 1, limit: 20 },
}: {
  studentId: string
  institutionId: string
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const [receipts, total] = await prisma.$transaction([
    prisma.receipt.findMany({
      where: { studentId, institutionId },
      include {
        payment: true,
      },
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
    }),
    prisma.receipt.count({ where: { studentId, institutionId } }),
  ])

  return {
    receipts,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

/**
 * Get receipt history for an institution
 */
export async function getInstitutionReceiptHistory({
  institutionId,
  pagination = { page: 1, limit: 50 },
}: {
  institutionId: string
  pagination: { page: number; limit: number }
}) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const [receipts, total] = await prisma.$transaction([
    prisma.receipt.findMany({
      where: { institutionId },
      include {
        payment: true,
        student: {
          include: { grade: true },
        },
      },
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
    }),
    prisma.receipt.count({ where: { institutionId } }),
  ])

  return {
    receipts,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

// ============================================================================
// RECEIPT ACKNOWLEDGMENT
// ============================================================================

/**
 * Mark receipt as acknowledged by parent/guardian
 */
export async function acknowledgeReceipt({
  receiptId,
  institutionId,
  acknowledgedByUserId,
}: {
  receiptId: string
  institutionId: string
  acknowledgedByUserId: string
}) {
  const receipt = await prisma.receipt.update({
    where: { id: receiptId, institutionId },
    data: {
      acknowledged: true,
      acknowledgedAt: new Date(),
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: acknowledgedByUserId,
      action: AuditAction.UPDATE,
      targetType: "Receipt",
      targetId: receiptId,
      institutionId,
      metadata: {
        action: "acknowledge_receipt",
      },
    },
  })

  return receipt
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

// Export receipt-related types