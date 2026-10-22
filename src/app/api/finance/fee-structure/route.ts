// Finance API Route Handler - SaintsHub School Finance
// Provides: Fee structures, invoices, payments (M-Pesa + manual), receipts, budgets, reports
// All routes enforce RBAC and institution scoping via middleware

import { withAuth, requirePermission } from "@/server/authorization"
import { createFeeStructure, getFeeStructures, getFeeStructureById, updateFeeStructure, createFeeItem, getFeeItems } from "@/server/services/finance/fee-structure/fee-structure.service"
import { generateInvoiceWorkflow, getInvoices, recordPayment } from "@/server/services/finance/invoices/invoices.service"
import { processMpesaCallback, processBankTransaction, processRefund } from "@/server/services/finance/payments/payments.service"
import { getReceipt, getReceiptHistory, getInstitutionReceiptHistory, acknowledgeReceipt } from "@/server/services/finance/receipts/receipts.service"
import { createBudget, getBudgets, addBudgetLine, getBudgetSummary } from "@/server/services/finance/budgets/budgets.service"
import { generateIncomeExpenditureStatement, generateDefaultersList, generateFeeSummaryByGrade } from "@/server/services/finance/reports/reports.service"
import { NextResponse } from "next/http"

// ============================================================================
// FEE STRUCTURE API
// ============================================================================

export async function GETfee-structure(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const activeOnly = searchParams.get("activeOnly") !== "false"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:read",
      async () => { },
      { anyOf: ["school:finance:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getFeeStructures({
      institutionId: institutionId as string,
      activeOnly,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fee structures" },
      { status: 500 }
    )
  }
}

export async function POSTfee-structure(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const structure = await createFeeStructure({
      data: body.feeStructureData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: structure,
      message: "Fee structure created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create fee structure" },
      { status: 400 }
    )
  }
}

export async function PUTfee-structure(request: Request, { params }: { params: { institution: string; id: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const id = params.id
    const updatedBy = body.updatedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const structure = await updateFeeStructure({
      structureId: id,
      institutionId: institutionId as string,
      data: body.feeStructureData,
      updatedById: updatedBy,
    })

    return NextResponse.json({
      success: true,
      data: structure,
      message: "Fee structure updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update fee structure" },
      { status: 400 }
    )
  }
}

// ============================================================================
// INVOICE API
// ============================================================================

export async function GETinvoices(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const status = searchParams.get("status") as any
    const studentId = searchParams.get("studentId")
    const termId = searchParams.get("termId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:read",
      async () => { },
      { anyOf: ["school:finance:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getInvoices({
      institutionId: institutionId as string,
      filters: studentId || termId ? { studentId: studentId, termId } : undefined,
      pagination: {
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "20"),
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}

export async function POSTinvoices(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await generateInvoiceWorkflow({
      data: body.invoiceData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate invoice" },
      { status: 400 }
    )
  }
}

// ============================================================================
// PAYMENT API
// ============================================================================

export async function GETpayments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:read",
      async () => { },
      { anyOf: ["school:finance:read"] }
    )

    if (permissionCheck) return permissionCheck

    // For now, return all payments for institution
    // In production, filter by student/status
    const payments = await prisma.payment.findMany({
      where: { institutionId },
      include {
        invoice: true,
        student: true,
      },
      orderBy: { transactionDate: "desc" },
    })

    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POSTpayments(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const processedBy = body.processedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    // Determine payment type
    const paymentType = body.paymentType || "mpesa"

    if (paymentType === "mpesa") {
      // Process M-Pesa callback
      // In production, this would receive the raw M-Pesa callback from Safaricom
      // For now, we'll expect a simplified payload
      const result = await processMpesaCallback({
        body: body.mpesaCallbackBody,
        institutionId: institutionId as string,
        mpesaConfig: body.mpesaConfig,
      })

      return NextResponse.json({
        success: result.success,
        data: result,
        message: result.message,
        alreadyProcessed: result.alreadyProcessed,
      })
    } else if (paymentType === "bank") {
      // Process bank transaction
      const result = await processBankTransaction({
        data: body.bankTransactionData,
        institutionId: institutionId as string,
        createdById: processedBy,
      })

      return NextResponse.json({
        success: true,
        data: result,
        message: "Bank transaction recorded successfully",
      })
    } else {
      // Generic payment recording
      const result = await recordPayment({
        invoiceId: body.invoiceId,
        institutionId: institutionId as string,
        paymentData: body.paymentData,
        processedById: processedBy,
      })

      return NextResponse.json({
        success: true,
        data: result,
        message: "Payment recorded successfully",
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: 400 }
    )
  }
}

// ============================================================================
// RECEIPT API
// ============================================================================

export async function GETreceipts(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const studentId = searchParams.get("studentId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:read",
      async () => { },
      { anyOf: ["school:finance:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (studentId) {
      const result = await getReceiptHistory({
        studentId,
        institutionId: institutionId as string,
        pagination: {
          page: parseInt(searchParams.get("page") || "1"),
          limit: parseInt(searchParams.get("limit") || "20"),
        },
      })
      return NextResponse.json(result)
    }

    const result = await getInstitutionReceiptHistory({
      institutionId: institutionId as string,
      pagination: {
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "50"),
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    )
  }
}

export async function POSTreceipts(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const issuedBy = body.issuedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await acknowledgeReceipt({
      receiptId: body.receiptId,
      institutionId: institutionId as string,
      acknowledgedByUserId: issuedBy,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Receipt acknowledgment updated",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to acknowledge receipt" },
      { status: 400 }
    )
  }
}

// ============================================================================
// BUDGET API
// ============================================================================

export async function GETbudgets(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const status = searchParams.get("status")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:read",
      async () => { },
      { anyOf: ["school:finance:read"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await getBudgets({
      institutionId: institutionId as string,
      status,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    )
  }
}

export async function POSTbudgets(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const createdBy = body.createdBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const budget = await createBudget({
      data: body.budgetData,
      institutionId: institutionId as string,
      createdById: createdBy,
    })

    return NextResponse.json({
      success: true,
      data: budget,
      message: "Budget created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create budget" },
      { status: 400 }
    )
  }
}

// ============================================================================
// REPORT API
// ============================================================================

export async function GETreports(request: Request, { params }: { params: { institution: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || params.institution
    const reportType = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const termId = searchParams.get("termId")

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:read",
      async () => { },
      { anyOf: ["school:finance:read"] }
    )

    if (permissionCheck) return permissionCheck

    if (reportType === "income-expenditure" && startDate && endDate) {
      const result = await generateIncomeExpenditureStatement({
        institutionId: institutionId as string,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      return NextResponse.json(result)
    }

    if (reportType === "defaulters" && termId) {
      const result = await generateDefaultersList({
        institutionId: institutionId as string,
        termId,
      })
      return NextResponse.json(result)
    }

    if (reportType === "fee-summary" && termId) {
      const result = await generateFeeSummaryByGrade({
        institutionId: institutionId as string,
        termId,
      })
      return NextResponse.json(result)
    }

    // Default: return available report types
    return NextResponse.json({
      availableTypes: ["income-expenditure", "defaulters", "fee-summary"],
      message: "Specify report type and parameters",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

// ============================================================================
// REFUND API
// ============================================================================

export async function POSTrefund(request: Request, { params }: { params: { institution: string } }) {
  try {
    const body = await request.json()
    const institutionId = body.institutionId || params.institution
    const processedBy = body.processedBy || "system"

    // Check permission
    const permissionCheck = await requirePermission(
      request,
      "school:finance:write",
      async () => { },
      { anyOf: ["school:finance:write"] }
    )

    if (permissionCheck) return permissionCheck

    const result = await processRefund({
      paymentId: body.paymentId,
      institutionId: institutionId as string,
      refundAmount: body.refundAmount,
      reason: body.reason,
      processedById: processedBy,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Refund processed successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 400 }
    )
  }
}

// ============================================================================
// EXPORT FOR MIDDLEWARE
// ============================================================================

export type {
  FeeStructure,
  FeeItem,
  Invoice,
  InvoiceLine,
  Payment,
  Receipt,
  BankTransaction,
  DiscountType,
  InvoiceStatus,
  PaymentMethod,
  BudgetSummary,
  PaymentRefund
}