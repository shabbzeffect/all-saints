import { NextResponse } from "next/http"

interface ReturnRecord {
  id: string
  loanId: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  borrowedDate: string
  dueDate: string
  returnDate: string
  fineAmount: number
  fineStatus: "PAID" | "UNPAID" | "WAIVED"
  processedBy: string
  processedAt: string
}

interface ReturnFilter {
  fineStatus?: "PAID" | "UNPAID" | "WAIVED"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fineStatus = searchParams.get("fineStatus") as "PAID" | "UNPAID" | "WAIVED" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock return records
    const mockReturns: ReturnRecord[] = [
      {
        id: "return-001",
        loanId: "loan-002",
        bookId: "book-003",
        bookTitle: "Mathematics Form 3",
        memberId: "std-002",
        memberName: "Jane Doe",
        borrowedDate: new Date(Date.now() - 45 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() - 20 * 86400000).toISOString().split("T")[0],
        returnDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        fineAmount: 500,
        fineStatus: "UNPAID",
        processedBy: "librarian-001",
        processedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: "return-002",
        loanId: "loan-003",
        bookId: "book-005",
        bookTitle: "Animal Farm",
        memberId: "std-003",
        memberName: "Peter Omondi",
        borrowedDate: new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        returnDate: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
        fineAmount: 0,
        fineStatus: "PAID",
        processedBy: "librarian-001",
        processedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: "return-003",
        loanId: "loan-001",
        bookId: "book-001",
        bookTitle: "The Great Gatsby",
        memberId: "std-001",
        memberName: "John Omondi",
        borrowedDate: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        returnDate: new Date().toISOString().split("T")[0],
        fineAmount: 0,
        fineStatus: "PAID",
        processedBy: "librarian-001",
        processedAt: new Date().toISOString(),
      },
    ]

    let filteredReturns = mockReturns

    if (fineStatus) {
      filteredReturns = filteredReturns.filter((r) => r.fineStatus === fineStatus)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredReturns = filteredReturns.filter(
        (r) => r.bookTitle.toLowerCase().includes(termLower) ||
        r.memberName.toLowerCase().includes(termLower) ||
        r.id.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredReturns,
    })
  } catch (error) {
    console.error("Library returns error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch return records" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new return record
    const newReturn: ReturnRecord = {
      id: `return-${Date.now().toString(36)}`,
      ...body,
      returnDate: new Date().toISOString().split("T")[0],
      fineStatus: "UNPAID",
      processedBy: "librarian-001",
      processedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newReturn,
      message: "Book return recorded successfully",
    })
  } catch (error) {
    console.error("Create return error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record book return" },
      { status: 500 }
    )
  }
}