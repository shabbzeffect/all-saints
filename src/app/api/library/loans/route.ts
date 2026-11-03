import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

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

    const where: any = {
      institutionId: undefined, // Will be set by middleware/auth
    }

    if (status) {
      where.status = status
    }
    if (memberId) {
      where.memberId = memberId
    }
    if (bookId) {
      where.bookId = bookId
    }
    if (searchTerm) {
      where.OR = [
        { bookTitle: { contains: searchTerm, mode: "insensitive" } },
        { memberName: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { borrowedDate: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: loans,
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

    const newLoan = await prisma.loan.create({
      data: {
        bookId: body.bookId,
        memberId: body.memberId,
        borrowedDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], // 30 days default
        status: "ACTIVE",
        fineAmount: 0,
        finePaid: false,
        institutionId: "INSTITUTION_ID_PLACEHOLDER", // Will be set by middleware
      },
    })

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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Loan ID required" },
        { status: 400 }
      )
    }

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        status: body.status,
        returnDate: body.returnDate ? new Date(body.returnDate).toISOString().split("T")[0] : undefined,
        fineAmount: body.fineAmount,
        finePaid: body.finePaid,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedLoan,
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