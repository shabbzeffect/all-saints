import { NextResponse } from "next/http"

interface LibraryFee {
  id: string
  memberId: string
  memberName: string
  admissionNumber: string
  type: "OVERDUE_FINE" | "LOST_BOOK" | "DAMAGED_BOOK" | "RESERVATION_FEE"
  description: string
  amount: number
  dateAssessed: string
  dueDate: string
  status: "PENDING" | "PAID" | "WAIVED"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

interface LibraryFeeFilter {
  status?: "PENDING" | "PAID" | "WAIVED"
  type?: "OVERDUE_FINE" | "LOST_BOOK" | "DAMAGED_BOOK" | "RESERVATION_FEE"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "PAID" | "WAIVED" || undefined
    const type = searchParams.get("type") as "OVERDUE_FINE" | "LOST_BOOK" | "DAMAGED_BOOK" | "RESERVATION_FEE" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock library fee data
    const mockFees: LibraryFee[] = [
      {
        id: "fee-001",
        memberId: "std-002",
        memberName: "Jane Doe",
        admissionNumber: "ADM-2024-002",
        type: "OVERDUE_FINE",
        description: "Overdue Mathematics Form 3 - 25 days late",
        amount: 500,
        dateAssessed: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        status: "UNPAID",
      },
      {
        id: "fee-002",
        memberId: "std-001",
        memberName: "John Omondi",
        admissionNumber: "ADM-2024-001",
        type: "LOST_BOOK",
        description: "Lost copy of The Great Gatsby",
        amount: 2000,
        dateAssessed: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        status: "PENDING",
      },
      {
        id: "fee-003",
        memberId: "std-003",
        memberName: "Peter Omondi",
        admissionNumber: "ADM-2024-003",
        type: "OVERDUE_FINE",
        description: "Overdue Animal Farm - 10 days late",
        amount: 250,
        dateAssessed: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        status: "WAIVED",
      },
    ]

    let filteredFees = mockFees

    if (status) {
      filteredFees = filteredFees.filter((f) => f.status === status)
    }
    if (type) {
      filteredFees = filteredFees.filter((f) => f.type === type)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredFees = filteredFees.filter(
        (f) => f.memberName.toLowerCase().includes(termLower) ||
        f.admissionNumber.toLowerCase().includes(termLower) ||
        f.description.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredFees,
    })
  } catch (error) {
    console.error("Library fees error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch library fees" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new library fee record
    const newFee: LibraryFee = {
      id: `fee-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      dateAssessed: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({
      success: true,
      data: newFee,
      message: "Library fee assessed successfully",
    })
  } catch (error) {
    console.error("Create library fee error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to assess library fee" },
      { status: 500 }
    )
  }
}