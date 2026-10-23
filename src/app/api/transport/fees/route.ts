import { NextResponse } from "next/http"

interface TransportFee {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  feeType: "MONTHLY" | "TERM" | "ANNUAL" | "PER_TRIP"
  description: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

interface TransportFeeFilter {
  status?: "PENDING" | "PAID" | "OVERDUE"
  feeType?: "MONTHLY" | "TERM" | "ANNUAL" | "PER_TRIP"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "PAID" | "OVERDUE" || undefined
    const feeType = searchParams.get("feeType") || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock transport fee data
    const mockFees: TransportFee[] = [
      {
        id: "fee-t001",
        studentId: "std-001",
        studentName: "John Omondi",
        admissionNumber: "ADM-2024-001",
        feeType: "MONTHLY",
        description: "Transport - Monthly Fee",
        amount: 3000,
        period: "October 2024",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "PENDING",
      },
      {
        id: "fee-t002",
        studentId: "std-002",
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-002",
        feeType: "MONTHLY",
        description: "Transport - Monthly Fee",
        amount: 3000,
        period: "October 2024",
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "OVERDUE",
      },
      {
        id: "fee-t003",
        studentId: "std-003",
        studentName: "Peter Omondi",
        admissionNumber: "ADM-2024-003",
        feeType: "MONTHLY",
        description: "Transport - Monthly Fee",
        amount: 3000,
        period: "October 2024",
        dueDate: new Date().toISOString().split("T")[0],
        status: "PAID",
        paidDate: new Date(Date.now() - 86400000).toISOString(),
        paymentMethod: "M-Pesa",
        receiptNumber: "REC-TRANS-001",
      },
    ]

    let filteredFees = mockFees

    if (status) {
      filteredFees = filteredFees.filter((f) => f.status === status)
    }
    if (feeType) {
      filteredFees = filteredFees.filter((f) => f.feeType === feeType)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredFees = filteredFees.filter(
        (f) => f.studentName.toLowerCase().includes(termLower) ||
        f.admissionNumber.toLowerCase().includes(termLower) ||
        f.receiptNumber?.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredFees,
    })
  } catch (error) {
    console.error("Transport fees error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transport fees" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new transport fee record
    const newFee: TransportFee = {
      id: `fee-t-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      dueDate: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({
      success: true,
      data: newFee,
      message: "Transport fee created successfully",
    })
  } catch (error) {
    console.error("Create transport fee error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create transport fee" },
      { status: 500 }
    )
  }
}