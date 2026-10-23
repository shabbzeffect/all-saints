import { NextResponse } from "next/http"

interface Loan {
  id: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  memberType: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  borrowedDate: string
  dueDate: string
  returnDate?: string
  status: "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST"
  fineAmount: number
  finePaid: boolean
}

interface LoanFilter {
  status?: "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST"
  memberId?: string
  bookId?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST" || undefined
    const memberId = searchParams.get("memberId") || undefined
    const bookId = searchParams.get("bookId") || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock loan data
    const mockLoans: Loan[] = [
      {
        id: "loan-001",
        bookId: "book-001",
        bookTitle: "The Great Gatsby",
        memberId: "std-001",
        memberName: "John Omondi",
        memberType: "STUDENT",
        borrowedDate: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        status: "ACTIVE",
        fineAmount: 0,
        finePaid: false,
      },
      {
        id: "loan-002",
        bookId: "book-003",
        bookTitle: "Mathematics Form 3",
        memberId: "std-002",
        memberName: "Jane Doe",
        memberType: "STUDENT",
        borrowedDate: new Date(Date.now() - 45 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() - 20 * 86400000).toISOString().split("T")[0],
        status: "OVERDUE",
        fineAmount: 500,
        finePaid: false,
      },
      {
        id: "loan-003",
        bookId: "book-005",
        bookTitle: "Animal Farm",
        memberId: "std-003",
        memberName: "Peter Omondi",
        memberType: "STUDENT",
        borrowedDate: new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "RETURNED",
        fineAmount: 0,
        finePaid: true,
      },
      {
        id: "loan-004",
        bookId: "book-002",
        bookTitle: "A Brief History of Time",
        memberId: "std-001",
        memberName: "John Omondi",
        memberType: "STUDENT",
        borrowedDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split("T")[0],
        status: "ACTIVE",
        fineAmount: 0,
        finePaid: false,
      },
    ]

    let filteredLoans = mockLoans

    if (status) {
      filteredLoans = filteredLoans.filter((l) => l.status === status)
    }
    if (memberId) {
      filteredLoans = filteredLoans.filter((l) => l.memberId === memberId)
    }
    if (bookId) {
      filteredLoans = filteredLoans.filter((l) => l.bookId === bookId)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredLoans = filteredLoans.filter(
        (l) => l.bookTitle.toLowerCase().includes(termLower) ||
        l.memberName.toLowerCase().includes(termLower) ||
        l.id.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredLoans,
    })
  } catch (error) {
    console.error("Library loans error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch loans" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new loan record
    const newLoan: Loan = {
      id: `loan-${Date.now().toString(36)}`,
      ...body,
      borrowedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], // 30 days default
      status: "ACTIVE",
      fineAmount: 0,
      finePaid: false,
    }

    return NextResponse.json({
      success: true,
      data: newLoan,
      message: "Book loaned successfully",
    })
  } catch (error) {
    console.error("Create loan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to loan book" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || ""
    const body = await request.json()

    // Update loan return status
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Loan ID required" },
        { status: 400 }
      )
    }

    // In a real app, would update the database
    const returnedLoan = {
      ...body,
      returnDate: new Date().toISOString().split("T")[0],
      status: body.status === "RETURNED" ? "RETURNED" : body.status,
    }

    if (body.status === "OVERDUE") {
      returnedLoan.fineAmount = 500 // Standard overdue fine
      returnedLoan.finePaid = false
    }

    return NextResponse.json({
      success: true,
      data: returnedLoan,
      message: `Book ${body.status.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error("Update loan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update loan" },
      { status: 500 }
    )
  }
}