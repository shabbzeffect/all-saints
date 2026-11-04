import { NextResponse } from "next/server"

interface FeePayment {
  id: string
  studentId: string
  admissionNumber: string
  studentName: string
  feeStructureId: string
  amount: number
  paymentMethod: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
  paymentDate: string
  receiptNumber: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  acknowledged: boolean
}

interface PaymentFilter {
  studentId?: string
  status?: "PENDING" | "COMPLETED" | "FAILED"
  searchTerm?: string
}

const mockPayments: FeePayment[] = [
  {
    id: "pay-001",
    studentId: "student-001",
    admissionNumber: "ADM-2024-001",
    studentName: "Brian Okoro",
    feeStructureId: "fee-001",
    amount: 30000,
    paymentMethod: "MPESA_STK_PUSH",
    paymentDate: new Date(Date.now() - 86400000).toISOString(),
    receiptNumber: "REC-ABC123",
    status: "COMPLETED",
    acknowledged: true,
  },
  {
    id: "pay-002",
    studentId: "student-002",
    admissionNumber: "ADM-2024-002",
    studentName: "Alice Wang",
    feeStructureId: "fee-001",
    amount: 30000,
    paymentMethod: "BANK_DEPOSIT",
    paymentDate: new Date(Date.now() - 172800000).toISOString(),
    receiptNumber: "REC-DEF456",
    status: "COMPLETED",
    acknowledged: true,
  },
  {
    id: "pay-003",
    studentId: "student-003",
    admissionNumber: "ADM-2024-003",
    studentName: "Carol Chebet",
    feeStructureId: "fee-002",
    amount: 5000,
    paymentMethod: "CASH",
    paymentDate: new Date(Date.now() - 259200000).toISOString(),
    receiptNumber: "REC-GHI789",
    status: "PENDING",
    acknowledged: false,
  },
  {
    id: "pay-004",
    studentId: "student-004",
    admissionNumber: "ADM-2024-004",
    studentName: "David Omondi",
    feeStructureId: "fee-003",
    amount: 25000,
    paymentMethod: "MPESA_STK_PUSH",
    paymentDate: new Date(Date.now() - 345600000).toISOString(),
    receiptNumber: "REC-JKL012",
    status: "FAILED",
    acknowledged: false,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")
    const searchTerm = searchParams.get("search")

    let filteredPayments = mockPayments

    if (studentId) {
      filteredPayments = filteredPayments.filter(
        (p) => p.studentId === studentId
      )
    }
    if (status) {
      filteredPayments = filteredPayments.filter((p) => p.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredPayments = filteredPayments.filter(
        (p) =>
          p.studentName.toLowerCase().includes(termLower) ||
          p.admissionNumber.toLowerCase().includes(termLower) ||
          p.receiptNumber.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredPayments,
    })
  } catch (error) {
    console.error("School finance payments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newPayment: FeePayment = {
      id: `pay-${Date.now().toString(36)}`,
      ...body,
      paymentDate: new Date().toISOString(),
      receiptNumber: `REC-${Date.now().toString(36).toUpperCase()}`,
      status: "PENDING",
      acknowledged: false,
    }

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: "Payment recorded successfully",
    })
  } catch (error) {
    console.error("Record payment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record payment" },
      { status: 500 }
    )
  }
}