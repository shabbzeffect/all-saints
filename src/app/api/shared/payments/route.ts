import { NextResponse } from "next/http"

interface Payment {
  id: string
  type: "SCHOOL_FEES" | "PARISH_OFFERING" | "TRANSPORT" | "BOARDING" | "OTHER"
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  payerName: string
  payerPhone?: string
  payerEmail?: string
  institutionId?: string
  description: string
  referenceNumber?: string
  transactionId?: string
  createdAt: string
  processedAt?: string
  metadata?: {
    paymentMethod?: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
    receiptNumber?: string
  }
}

interface PaymentFilter {
  type?: "SCHOOL_FEES" | "PARISH_OFFERING" | "TRANSPORT" | "BOARDING" | "OTHER"
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "SCHOOL_FEES" | "PARISH_OFFERING" | "TRANSPORT" | "BOARDING" | "OTHER" || undefined
    const status = searchParams.get("status") as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock payments
    const mockPayments: Payment[] = [
      {
        id: "pay-001",
        type: "SCHOOL_FEES",
        amount: 30000,
        currency: "KES",
        status: "COMPLETED",
        payerName: "Robert Wang",
        payerPhone: "+254712345678",
        payerEmail: "robert.wang@email.com",
        institutionId: "inst-school-1",
        description: "Term 1 tuition fees",
        referenceNumber: "REF-2024-001",
        transactionId: "TXN-20240827-001",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        processedAt: new Date(Date.now() - 86400000).toISOString(),
        metadata: {
          paymentMethod: "MPESA_STK_PUSH",
          receiptNumber: "REC-2024-001",
        },
      },
      {
        id: "pay-002",
        type: "PARISH_OFFERING",
        amount: 1000,
        currency: "KES",
        status: "COMPLETED",
        payerName: "Jane Doe",
        payerPhone: "+254723456789",
        description: "Weekly offering",
        referenceNumber: "REF-2024-002",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        processedAt: new Date(Date.now() - 172800000).toISOString(),
        metadata: {
          paymentMethod: "MPESA_STK_PUSH",
          receiptNumber: "REC-2024-002",
        },
      },
      {
        id: "pay-003",
        type: "TRANSPORT",
        amount: 5000,
        currency: "KES",
        status: "PENDING",
        payerName: "Michael Okoro",
        payerPhone: "+254734567890",
        description: "Term 1 transport fee - Route A",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        metadata: {
          paymentMethod: "MPESA_STK_PUSH",
        },
      },
    ]

    let filteredPayments = mockPayments

    if (type) {
      filteredPayments = filteredPayments.filter((p) => p.type === type)
    }
    if (status) {
      filteredPayments = filteredPayments.filter((p) => p.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredPayments = filteredPayments.filter(
        (p) => p.payerName.toLowerCase().includes(termLower) || p.description.toLowerCase().includes(termLower) || p.referenceNumber?.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredPayments,
    })
  } catch (error) {
    console.error("Shared payments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new payment record
    const newPayment: Payment = {
      id: `pay-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: "Payment record created successfully",
    })
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create payment record" },
      { status: 500 }
    )
  }
}