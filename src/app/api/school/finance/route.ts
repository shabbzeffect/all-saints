import { NextResponse } from "next/http"

interface FeeStructureItem {
  id: string
  name: string
  description: string
  amount: number
  frequency: "ONCE" | "TERMLY" | "ANNUAL" | "MONTHLY"
  isMandatory: boolean
  applicableGrades: string[]
  wing: "SCHOOL" | "PARISH"
}

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

interface FinanceFilter {
  grade?: string
  mandatory?: boolean
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || "inst-school-1"
    const grade = searchParams.get("grade")
    const mandatory = searchParams.get("mandatory") === "true"
    const searchTerm = searchParams.get("search") || ""

    // Mock fee structure
    const mockFeeStructure: FeeStructureItem[] = [
      {
        id: "fee-001",
        name: "Tuition Fee",
        description: "Annual tuition fee divided into 3 terms",
        amount: 30000,
        frequency: "TERMLY",
        isMandatory: true,
        applicableGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
        wing: "SCHOOL",
      },
      {
        id: "fee-002",
        name: "Activity Fee",
        description: "Termly activity and sports fee",
        amount: 5000,
        frequency: "TERMLY",
        isMandatory: true,
        applicableGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"],
        wing: "SCHOOL",
      },
      {
        id: "fee-003",
        name: "Boarding Fee",
        description: "Full boarding fee per term",
        amount: 25000,
        frequency: "TERMLY",
        isMandatory: true,
        applicableGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        wing: "SCHOOL",
      },
      {
        id: "fee-004",
        name: "Pledge Donation",
        description: "Optional giving/pledge donation",
        amount: 1000,
        frequency: "ONCE",
        isMandatory: false,
        applicableGrades: [],
        wing: "PARISH",
      },
    ]

    let filteredFees = mockFeeStructure

    if (grade) {
      filteredFees = filteredFees.filter((f) => f.applicableGrades.includes(grade))
    }
    if (mandatory !== undefined) {
      filteredFees = filteredFees.filter((f) => f.isMandatory === mandatory)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredFees = filteredFees.filter(
        (f) => f.name.toLowerCase().includes(termLower) || f.description.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: { feeStructure: filteredFees },
    })
  } catch (error) {
    console.error("School finance error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch fee structure" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Record fee payment
    const newPayment: FeePayment = {
      id: `pay-${Date.now().toString(36)}`,
      studentId: body.studentId,
      admissionNumber: body.admissionNumber || "",
      studentName: body.studentName || "",
      feeStructureId: body.feeStructureId,
      amount: body.amount,
      paymentMethod: body.paymentMethod || "MPESA_STK_PUSH",
      paymentDate: new Date().toISOString(),
      receiptNumber: `REC-${Date.now().toString(36).toUpperCase()}`,
      status: "COMPLETED",
      acknowledged: false,
    }

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: "Fee payment recorded successfully",
    })
  } catch (error) {
    console.error("Record fee payment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record fee payment" },
      { status: 500 }
    )
  }
}