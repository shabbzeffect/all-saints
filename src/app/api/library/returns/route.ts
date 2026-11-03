import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

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

    const where: any = {
      institutionId: undefined, // Will be set by middleware/auth
    }

    if (fineStatus) {
      where.status = fineStatus as "ISSUED" | "RETURNED" | "LOST" | "DAMAGED"
    }
    if (searchTerm) {
      where.OR = [
        { book: { title: { contains: searchTerm, mode: "insensitive" } } },
        { student: { name: { contains: searchTerm, mode: "insensitive" } } },
      ]
    }

    const borrows = await prisma.borrowRecord.findMany({
      where,
      orderBy: { returnedAt: "desc" },
    })

    // Map BorrowRecord to ReturnRecord format
    const returns = borrows.map((borrow) => {
      const fineStatusMap: Record<string, "PAID" | "UNPAID" | "WAIVED"> = {
        RETURNED: "PAID",
        ISSUED: "UNPAID",
        LOST: "UNPAID",
        DAMAGED: "UNPAID",
      }
      return {
        id: borrow.id,
        loanId: borrow.id,
        bookId: borrow.bookId,
        bookTitle: borrow.book?.title || "Unknown",
        memberId: borrow.studentId,
        memberName: borrow.student?.name || "Unknown",
        borrowedDate: borrow.issuedAt.toISOString().split("T")[0],
        dueDate: borrow.dueDate.toISOString().split("T")[0],
        returnDate: borrow.returnedAt?.toISOString().split("T")[0] || "",
        fineAmount: borrow.fineAmount || 0,
        fineStatus: fineStatusMap[borrow.status] || "UNPAID",
        processedBy: "librarian-001",
        processedAt: borrow.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      } as ReturnRecord
    })

    return NextResponse.json({
      success: true,
      data: returns,
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

    // Find the active borrow record and mark it as returned
    const borrow = await prisma.borrowRecord.findFirst({
      where: {
        bookId: body.bookId,
        studentId: body.memberId,
        status: "ACTIVE",
      },
    })

    if (!borrow) {
      return NextResponse.json(
        { success: false, error: "Active borrow record not found" },
        { status: 404 }
      )
    }

    const returnedBorrow = await prisma.borrowRecord.update({
      where: { id: borrow.id },
      data: {
        status: "RETURNED" as const,
        returnedAt: new Date().toISOString(),
        fineAmount: body.fineAmount,
      },
    })

    // Create a return record
    const returnRecord = await prisma.borrowRecord.create({
      data: {
        bookId: body.bookId,
        studentId: body.memberId,
        status: "RETURNED" as const,
        issuedAt: borrow.issuedAt,
        dueDate: borrow.dueDate,
        returnedAt: new Date().toISOString(),
        fineAmount: body.fineAmount,
        finePaid: body.fineStatus === "PAID",
        institutionId: "INSTITUTION_ID_PLACEHOLDER", // Will be set by middleware
      },
    })

    return NextResponse.json({
      success: true,
      data: returnRecord,
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