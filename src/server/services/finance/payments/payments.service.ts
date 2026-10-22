/* Payments Service - SaintsHub School Finance
Handles: Payment processing, M-Pesa callback handling, bank transactions, refunds
*/
import { prisma } from "../../db"
import { AuditAction, AuditEvent } from "@prisma/client"
import { formatCurrency, parseCurrency } from "@/lib/config"
import { createNotification, markNotificationSent } from "../notification.service"
import { createBackgroundJob } from "../jobs/job.service"
import { normalizePhone } from "@/lib/phone"

// ============================================================================
// M-PESA CALLBACK PROCESSING
// ============================================================================

/**
 * Process M-Pesa STK Push callback
 * This is the core integration point for M-Pesa payments
 */
export async function processMpesaCallback({
  body,
  institutionId,
  mpesaConfig,
}: {
  body: any // Raw M-Pesa callback payload
  institutionId: string
  mpesaConfig: any // MpesaConfig from DB
}) {
  const {
    Body,
  } = body

  if (!Body) {
    throw new Error("Invalid M-Pesa callback format")
  }

  const {
    stkCallback,
  } = Body

  if (!stkCallback) {
    throw new Error("No STK callback data found")
  }

  const {
    MerchantRequestID,
    RequestID,
    ResultCode,
    ResultDesc,
    CallbackTime,
    // M-Pesa fields
    CustomerName,
    CustomerMSISDN,
    Amount,
    MpesaReceiptNumber,
    Balance,
    PhoneNumber,
  } = stkCallback

  // Check result code - 0 means success
  const isSuccess = ResultCode === 0

  // Find the invoice or payment associated with this callback
  // The account reference should be the invoice number or student admission number
  const accountReference = body.Body.stkCallback.CallBackMetadata?.find(
    (meta: any) => meta.Key === "AccountReference"
  )?.Value

  if (!accountReference) {
    // Log failed callback without matching invoice
    await prisma.auditEvent.create({
      data: {
        action: AuditAction.PAYMENT_FAILED,
        targetType: "Payment",
        metadata: {
          action: "mpesa_callback_no_reference",
          resultCode: ResultCode,
          resultDesc: ResultDesc,
        },
      },
    })

    return {
      success: false,
      error: "No account reference found in callback",
    }
  }

  // Try to find matching invoice
  const invoice = await prisma.invoice.findFirst({
    where: {
      institutionId,
      invoiceNumber: accountReference,
    },
    include { student: true },
  })

  // Or try to find by student admission number
  let paymentRecord = null

  if (!invoice) {
    const student = await prisma.student.findFirst({
      where: {
        institutionId,
        admissionNumber: accountReference,
      },
    })

    if (student) {
      // Find unpaid invoices for this student
      const unpaidInvoices = await prisma.invoice.findMany({
        where: {
          institutionId,
          studentId: student.id,
          status: {
            ne: InvoiceStatus.FULLY_PAID,
            ne: InvoiceStatus.WRITTEN_OFF,
          },
        },
      })

      if (unpaidInvoices.length > 0) {
        // Use the first unpaid invoice
        invoice = unpaidInvoices[0]
      }
    }
  }

  if (!invoice) {
    // No matching invoice found - create a payment record anyway for tracking
    // but mark as unmatched
    paymentRecord = await prisma.payment.create({
      data: {
        institutionId,
        amount: Amount ? Math.round(parseFloat(Amount) * 100) : 0,
        paymentMethod: PaymentMethod.MPESA_STK_PUSH,
        reference: MerchantRequestID,
        transactionId: MpesaReceiptNumber,
        status: isSuccess ? "SUCCESS" : "FAILED",
      },
    })

    await prisma.auditEvent.create({
      data: {
        action: AuditAction.PAYMENT_INITIATE,
        targetType: "Payment",
        metadata: {
          action: "mpesa_callback_no_invoice",
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          merchantRequestID: MerchantRequestID,
          amount: Amount,
          phoneNumber: PhoneNumber,
        },
      },
    })

    return {
      success: isSuccess,
      error: "No matching invoice found - payment recorded as orphan",
    }
  }

  // Process the payment
  const amount = Amount ? Math.round(parseFloat(Amount) * 100) : 0 // M-Pesa Amount is already in KES, convert to cents

  // Check if this exact amount+invoice already processed (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      invoiceId: invoice.id,
      reference: MerchantRequestID,
    },
  })

  if (existingPayment) {
    // Already processed - return idempotent response
    return {
      success: true,
      alreadyProcessed: true,
      payment: existingPayment,
      message: "Callback already processed - idempotent",
    }
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      institutionId,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount,
      paymentMethod: PaymentMethod.MPESA_STK_PUSH,
      reference: MerchantRequestID,
      transactionId: MpesaReceiptNumber,
      status: isSuccess ? "SUCCESS" : "FAILED",
    },
    include {
      student: true,
      invoice: true,
    },
  })

  // Update invoice payment status
  const newAmountPaid = (invoice.amountPaid || 0) + amount
  const newAmountRemaining = Math.max(0, (invoice.totalAmount || 0) - newAmountPaid)
  let newStatus: InvoiceStatus = InvoiceStatus.SENT

  if (newAmountRemaining <= 0) {
    newStatus = InvoiceStatus.FULLY_PAID
  } else if (newAmountRemaining < (invoice.totalAmount || 0)) {
    newStatus = InvoiceStatus.PARTIALLY_PAID
  } else if (newAmountRemaining > 0 && invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
    newStatus = InvoiceStatus.OVERDUE
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id, institutionId },
    data: {
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      status: newStatus,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      action: isSuccess ? AuditAction.PAYMENT_COMPLETE : AuditAction.PAYMENT_FAILED,
      targetType: "Payment",
      targetId: payment.id,
      institutionId,
      metadata: {
        action: "mpesa_callback_processed",
        invoiceNumber: invoice.invoiceNumber,
        student: invoice.student?.firstName,
        amount: amount,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        mpesaReceiptNumber: MpesaReceiptNumber,
        phoneNumber: PhoneNumber || CustomerMSISDN,
      },
    },
  })

  // If payment successful and invoice now fully paid, generate receipt
  if (isSuccess && newStatus === InvoiceStatus.FULLY_PAID) {
    await createReceiptAuto({
      paymentId: payment.id,
      institutionId,
      amount,
      processedById: payment.processedBy || "system",
    })
  }

  // Create notification based on payment status
  if (isSuccess) {
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.SMS,
      subject: "Payment Received - All Saints Mushililie Academy",
      body: `Payment of KSh ${(amount / 100).toLocaleString()} received for invoice ${invoice.invoiceNumber}. Balance: KSh ${(newAmountRemaining / 100).toLocaleString() || "0"}`,
      templateId: "payment_received",
      priority: 1,
    })
  } else {
    // Payment failed
    await createNotification({
      recipientId: "",
      institutionId,
      channel: NotificationChannel.SMS,
      subject: "Payment Failed - All Saints Mushililie Academy",
      body: `Payment for invoice ${invoice.invoiceNumber} failed: ${ResultDesc || "Unknown error"}`,
      templateId: "payment_failed",
      priority: 2,
    })
  }

  return {
    success: isSuccess,
    payment,
    invoice: updatedInvoice,
    message: isSuccess
      ? "M-Pesa payment processed successfully"
      : "M-Pesa payment failed - see notification",
  }
}

/**
 * Process bank deposit/cheque payment (manual entry)
 */
export async function processBankTransaction({
  data,
  institutionId,
  createdById,
}: {
  data: {
    reference: string
    amount: number
    paymentMethod: PaymentMethod
    bankName?: string
    branch?: string
    chequeNumber?: string
    notes?: string
  },
  institutionId: string
  createdById: string
}) {
  const amountInCents = Math.round(parseFloat(data.amount.toString()) * 100)

  const bankTransaction = await prisma.bankTransaction.create({
    data: {
      institutionId,
      reference: data.reference,
      amount: amountInCents,
      paymentMethod: data.paymentMethod,
      bankName: data.bankName,
      branch: data.branch,
      chequeNumber: data.chequeNumber,
      notes: data.notes,
    },
  })

  // Audit log
  await prisma.auditEvent.create({
    data: {
      actorId: createdById,
      action: AuditAction.CREATE,
      targetType: "BankTransaction",
      targetId: bankTransaction.id,
      institutionId,
      metadata: {
        action: "create_bank_transaction",
        reference: data.reference,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      },
    },
  })

  // Find matching unpaid invoice
  const invoice = await prisma.invoice.findFirst({
    where: {
      institutionId,
      status: {
        ne: InvoiceStatus.FULLY_PAID,
        ne: InvoiceStatus.WRITTEN_OFF,
      },
      OR: [
        { invoiceNumber: data.reference },
        { lines: { some: { feeItem: { name: { contains: "fees" } } } } },
      ],
    },
  })

  if (invoice) {
    // Record payment against invoice
    const payment = await prisma.payment.create({
      data: {
        institutionId,
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount: amountInCents,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        status: "SUCCESS",
        processedBy: createdById,
      },
    })

    // Update invoice
    const newAmountPaid = (invoice.amountPaid || 0) + amountInCents
    const newAmountRemaining = Math.max(0, (invoice.totalAmount || 0) - newAmountPaid)
    let newStatus: InvoiceStatus = InvoiceStatus.SENT

    if (newAmountRemaining <= 0) {
      newStatus = InvoiceStatus.FULLY_PAID
    } else if (newAmountRemaining < (invoice.totalAmount || 0)) {
      newStatus = InvoiceStatus.PARTIALLY_PAID
    }

    await prisma.invoice.update({
      where: { id: invoice.id, institutionId },
      data: {
        amountPaid: newAmountPaid,
        amountRemaining: newAmountRemaining,
        status: newStatus,
      },
    })

    // If fully paid, create receipt
    if (newStatus === InvoiceStatus.FULLY_PAID) {
      await createReceiptAuto({
        paymentId: payment.id,
        institutionId,
        amount: amountInCents,
        processedById,
      })
    }

    return {
      bankTransaction,
      payment,
      invoice: updatedInvoice,
    }
  }

  // No matching invoice - just record the bank transaction
  return {
    bankTransaction,
  }
}

/**
 * Process refund
 */
export async function processRefund({
  paymentId,
  institutionId,
  refundAmount,
  reason,
  processedById,
}: {
  paymentId: string
  institutionId: string
  refundAmount: number
  reason: string
  processedById: string
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, institutionId },
    include { invoice: true, student: true },
  })

  if (!payment) {
    throw new Error("Payment not found")
  }

  if (payment.amount < refundAmount) {
    throw new Error("Refund amount exceeds payment amount")
  }

  const amountInCents = Math.round(parseFloat(refundAmount.toString()) * 100)

  // Create refund record (we'll use a negative payment or adjust the original)
  // For now, create a new payment with REFUNDED status
  const refund = await prisma.payment.create({
    data: {
      institutionId,
      invoiceId: payment.invoiceId,
      studentId: payment.studentId,
      amount: amountInCents,
      paymentMethod: payment.paymentMethod,
      reference: `REFUND-${payment.reference}`,
      status: "REFUNDED",
      processedBy: processedById,
    },
    include {
      student: true,
      invoice: true,
    },
  })

  // Update invoice amount paid (reduce it)
  const originalPayment = await prisma.payment.findFirst({
    where: { invoiceId: payment.invoiceId, institutionId },
    orderBy: { createdAt: "asc" },
  })

  let totalPaid = 0
  const allPayments = await prisma.payment.findMany({
    where: { invoiceId: payment.invoiceId, institutionId },
  })

  allPayments.forEach((p) => {
    if (p.status === "SUCCESS") {
      totalPaid += p.amount
    }
  })

  // Reduce the invoice amount paid by the refund amount
  const newAmountPaid = Math.max(0, totalPaid - amountInCents)
  const newAmountRemaining = Math.max(0, (invoice.totalAmount || 0) - newAmountPaid)

  let newStatus: InvoiceStatus = InvoiceStatus.SENT

  if (newAmountRemaining <= 0) {
    newStatus = InvoiceStatus.FULLY_PAID
  } else if (newAmountRemaining < (invoice.totalAmount || 0)) {
    newStatus = InvoiceStatus.PARTIALLY_PAID
  }

  await prisma.invoice.update({
    where: { id: payment.invoiceId, institutionId },
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
      action: AuditAction.UPDATE,
      targetType: "Payment",
      targetId: refund.id,
      institutionId,
      metadata: {
        action: "process_refund",
        originalPayment: payment.id,
        refundAmount: amountInCents,
        reason: reason,
      },
    },
  })

  // Notify
  await createNotification({
    recipientId: "",
    institutionId,
    channel: NotificationChannel.SMS,
    subject: "Refund Processed - All Saints Mushililie Academy",
    body: `Refund of KSh ${(amountInCents / 100).toLocaleString()} processed for invoice ${payment.invoice?.invoiceNumber || ""}.`,
    templateId: "refund_processed",
    priority: 1,
  })

  return refund
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  Payment,
  BankTransaction,
  PaymentMethod
}