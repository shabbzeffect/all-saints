import { NextResponse } from "next/http"

interface BoardingBilling {
  id: string
  studentId: string
  studentName: string
  studentAdmission: string
  feeId: string
  feeName: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

interface BillingFilter {
  studentId?: string
  status?: "PENDING" | "PAID" | "OVERDUE"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status") as "PENDING" | "PAID" | "OVERDUE" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock boarding billing data
    const mockBilling: BoardingBilling[] = [
      {
        id: "bill-001",
        studentId: "std-001",
        studentName: "John Omondi",
        studentAdmission: "ADM-2024-001",
        feeId: "fee-001",
        feeName: "Full Boarding - Termly",
        amount: 75000,
        period: "Term 1 2024",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "PENDING",
      },
      {
        id: "bill-002",
        studentId: "std-002",
        studentName: "Jane Doe",
        studentAdmission: "ADM-2024-002",
        feeId: "fee-001",
        feeName: "Full Boarding - Termly",
        amount: 75000,
        period: "Term 1 2024",
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "OVERDUE",
      },
      {
        id: "bill-003",
        studentId: "std-003",
        studentName: "Peter Omondi",
        studentAdmission: "ADM-2024-003",
        feeId: "fee-001",
        feeName: "Full Boarding - Termly",
        amount: 75000,
        period: "Term 1 2024",
        dueDate: new Date().toISOString().split("T")[0],
        status: "PAID",
        paidDate: new Date(Date.now() - 86400000).toISOString(),
        paymentMethod: "M-Pesa STK Push",
        receiptNumber: "REC-2024-001",
      },
    ]

    let filteredBilling = mockBilling

    if (studentId) {
      filteredBilling = filteredBilling.filter((b) => b.studentId === studentId)
    }
    if (status) {
      filteredBilling = filteredBilling.filter((b) => b.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredBilling = filteredBilling.filter(
        (b) => b.studentName.toLowerCase().includes(termLower) ||
        b.feeName.toLowerCase().includes(termLower) ||
        b.receiptNumber?.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredBilling,
    })
  } catch (error) {
    console.error("Boarding billing error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch boarding billing" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new billing record
    const newBilling: BoardingBilling = {
      id: `bill-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      dueDate: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({
      success: true,
      data: newBilling,
      message: "Billing record created successfully",
    })
  } catch (error) {
    console.error("Create billing error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create billing record" },
      { status: 500 }
    )
  }
}