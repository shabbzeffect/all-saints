import { NextResponse } from "next/http"

interface PaymentRequest {
  institutionId: string
  invoiceId: string
  paymentType: "mpesa" | "bank"
  mpesaCallbackBody?: any
  bankTransactionData?: {
    reference: string
    amount: number
    paymentMethod: string
    bankName: string
    branch: string
    chequeNumber: string
    notes: string
  }
  processedBy: "Parent" | "Staff"
}

interface PaymentResponse {
  alreadyProcessed: boolean
  payment?: {
    id: string
    receiptNumber: string
    amount: number
    status: string
    createdAt: string
  }
  message?: string
}

export async function POST(request: Request) {
  try {
    const body: PaymentRequest = await request.json()

    // Simulate payment processing
    // In a real app, this would integrate with M-Pesa STK API or bank payment system
    const { institutionId, invoiceId, paymentType, processedBy } = body

    // Simulate successful payment
    const mockReceiptNumber = `REC-${invoiceId}-${Date.now().toString(36).padStart(6, "0").toUpperCase()}`

    const response: PaymentResponse = {
      alreadyProcessed: false,
      payment: {
        id: invoiceId,
        receiptNumber: mockReceiptNumber,
        amount: body.mpesaCallbackBody?.CustomerMSISDN
          ? Math.round((body.mpesaCallbackBody.Amount || 0) * 100) / 100
          : 0,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      },
    }

    // If M-Pesa callback, mark as already processed on second call
    if (body.mpesaCallbackBody && processedBy === "Parent") {
      response.alreadyProcessed = true
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error("Parent payment error:", error)
    return NextResponse.json(
      { success: false, error: "Payment processing failed" },
      { status: 500 }
    )
  }
}