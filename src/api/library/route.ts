/* eslint-disable react/prop-types */
/* Library Module API Routes - SaintsHub */
import { NextResponse } from "next/server"
import { prisma } from "@/src/server/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const studentId = searchParams.get("studentId")
    const bookId = searchParams.get("bookId")

    switch (action) {
      case "books": {
        const books = await prisma.book.findMany({
          where: { institutionId: "inst-school-1" },
          include: {
            borrows: {
              where: { status: "ISSUED" },
              include: { student: { include: { user: true } } },
            },
            reservations: {
              where: { status: "PENDING" },
              include: { student: { include: { user: true } } },
            },
          },
          orderBy: { title: "asc" },
        })
        return NextResponse.json(books)
      }

      case "book-by-id": {
        if (!bookId) {
          return NextResponse.json({ error: "bookId required" }, { status: 400 })
        }
        const book = await prisma.book.findUnique({
          where: { id: bookId },
          include: {
            borrows: {
              where: { status: "ISSUED" },
              include: { student: { include: { user: true } } },
            },
            reservations: true,
          },
        })
        if (!book) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 })
        }
        return NextResponse.json(book)
      }

      case "student-borrows": {
        if (!studentId) {
          return NextResponse.json({ error: "studentId required" }, { status: 400 })
        }
        const borrows = await prisma.borrowRecord.findMany({
          where: { studentId },
          include: { book: true },
          orderBy: { issuedAt: "desc" },
        })
        return NextResponse.json(borrows)
      }

      case "student-reservations": {
        if (!studentId) {
          return NextResponse.json({ error: "studentId required" }, { status: 400 })
        }
        const reserves = await prisma.reserveRecord.findMany({
          where: { studentId },
          include: { book: true },
          orderBy: { requestedAt: "desc" },
        })
        return NextResponse.json(reserves)
      }

      case "issue-book": {
        const { bookId, studentId, issuedBy } = await request.json()

        // Check book availability
        const book = await prisma.book.findUnique({
          where: { id: bookId },
        })

        if (!book) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 })
        }

        if (book.copiesAvailable <= 0) {
          return NextResponse.json({ error: "No copies available" }, { status: 400 })
        }

        // Check if student already has this book issued
        const existingBorrow = await prisma.borrowRecord.findFirst({
          where: { bookId, studentId, status: "ISSUED" },
        })

        if (existingBorrow) {
          return NextResponse.json({ error: "Book already issued to this student" }, { status: 400 })
        }

        // Issue the book
        const borrow = await prisma.borrowRecord.create({
          data: {
            bookId,
            studentId,
            issuedAt: new Date(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
            status: "ISSUED",
          },
        })

        // Update book availability
        await prisma.book.update({
          where: { id: bookId },
          data: { copiesAvailable: { decrement: 1 } },
        })

        return NextResponse.json(borrow)
      }

      case "return-book": {
        const { borrowId, condition, notes } = await request.json()

        const borrow = await prisma.borrowRecord.findUnique({
          where: { id: borrowId },
        })

        if (!borrow) {
          return NextResponse.json({ error: "Borrow record not found" }, { status: 404 })
        }

        if (borrow.status === "RETURNED") {
          return NextResponse.json({ error: "Book already returned" }, { status: 400 })
        }

        // Calculate overdue days
        const now = new Date()
        const dueDate = borrow.dueDate ? new Date(borrow.dueDate) : now
        const overdueDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        const fineAmount = overdueDays * 50 // KES 50 per day fine

        // Update borrow record
        const updatedBorrow = await prisma.borrowRecord.update({
          where: { id: borrowId },
          data: {
            status: "RETURNED",
            returnedAt: now,
            fineAmount,
            ...(condition === "DAMAGED" ? { fineAmount: borrow.fineAmount + 500 } : {}), // Additional damage fee
          },
        })

        // Update book availability
        await prisma.book.update({
          where: { id: borrow.bookId },
          data: { copiesAvailable: { increment: 1 } },
        })

        return NextResponse.json({
          borrow: updatedBorrow,
          overdueDays,
          fineAmount,
          fineDetails: condition === "DAMAGED" ? "Plus KES 500 damage fee" : "",
        })
      }

      case "reserve-book": {
        const { bookId, studentId, requestedBy } = await request.json()

        // Check if book exists and is issuable
        const book = await prisma.book.findUnique({
          where: { id: bookId },
        })

        if (!book) {
          return NextResponse.json({ error: "Book not found" }, { status: 404 })
        }

        // Check if student already has active reservation for this book
        const existingReserve = await prisma.reserveRecord.findFirst({
          where: { bookId, studentId, status: "PENDING" },
        })

        if (existingReserve) {
          return NextResponse.json({ error: "Active reservation already exists" }, { status: 400 })
        }

        // Check if student already has this book issued
        const existingBorrow = await prisma.borrowRecord.findFirst({
          where: { bookId, studentId, status: "ISSUED" },
        })

        if (existingBorrow) {
          return NextResponse.json({ error: "Student already has this book issued" }, { status: 400 })
        }

        const reserve = await prisma.reserveRecord.create({
          data: {
            bookId,
            studentId,
            requestedAt: new Date(),
            status: "PENDING",
          },
        })

        return NextResponse.json(reserve)
      }

      case "fulfill-reservation": {
        const { reserveId, fulfilledBy } = await request.json()

        const reserve = await prisma.reserveRecord.findUnique({
          where: { id: reserveId },
        })

        if (!reserve) {
          return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
        }

        if (reserve.status !== "PENDING") {
          return NextResponse.json({ error: "Reservation not in pending state" }, { status: 400 })
        }

        // Check if book is available to fulfill
        const book = await prisma.book.findUnique({
          where: { id: reserve.bookId },
        })

        if (book.copiesAvailable > 0) {
          // Book available - issue it directly
          const borrow = await prisma.borrowRecord.create({
            data: {
              bookId: reserve.bookId,
              studentId: reserve.studentId,
              issuedAt: new Date(),
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              status: "ISSUED",
            },
          })

          // Update book availability
          await prisma.book.update({
            where: { id: reserve.bookId },
            data: { copiesAvailable: { decrement: 1 } },
          })

          // Update reservation status
          await prisma.reserveRecord.update({
            where: { id: reserveId },
            data: { status: "FULFILLED", fulfilledAt: new Date(), fulfilledBy },
          })

          return NextResponse.json({ borrow, reserve })
        } else {
          // Book not available - mark reservation as cancelled
          await prisma.reserveRecord.update({
            where: { id: reserveId },
            data: { status: "CANCELLED" },
          })

          return NextResponse.json({ error: "Book no longer available for reservation" }, { status: 400 })
        }
      }

      case "library-fines": {
        const fines = await prisma.libraryFine.findMany({
          where: { institutionId: "inst-school-1" },
          orderBy: { fineName: "asc" },
        })
        return NextResponse.json(fines)
      }

      case "student-outstanding-fines": {
        if (!studentId) {
          return NextResponse.json({ error: "studentId required" }, { status: 400 })
        }

        // Get all unpaid borrow records with fines
        const unpaidBorrows = await prisma.borrowRecord.findMany({
          where: { studentId, status: "RETURNED", finePaid: false },
          include: { book: true },
        })

        // Calculate total fines
        const totalFine = unpaidBorrows.reduce((sum, borrow) => sum + (borrow.fineAmount || 0), 0)

        return NextResponse.json({
          borrows: unpaidBorrows,
          totalFine,
        })
      }

      case "pay-fine": {
        const { borrowId, paidBy } = await request.json()

        const borrow = await prisma.borrowRecord.findUnique({
          where: { id: borrowId },
        })

        if (!borrow) {
          return NextResponse.json({ error: "Borrow record not found" }, { status: 404 })
        }

        if (borrow.finePaid) {
          return NextResponse.json({ error: "Fine already paid" }, { status: 400 })
        }

        // Mark fine as paid
        const updatedBorrow = await prisma.borrowRecord.update({
          where: { id: borrowId },
          data: { finePaid: true, finePaidAt: new Date(), finePaidBy: paidBy },
        })

        return NextResponse.json(updatedBorrow)
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Library API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "create-book": {
        const {
          institutionId,
          title,
          isbn,
          author,
          coAuthor,
          publisher,
          publicationYear,
          category,
          description,
          pageCount,
          language,
        } = body

        const book = await prisma.book.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            title,
            isbn,
            author,
            coAuthor: coAuthor || "",
            publisher: publisher || "",
            publicationYear: publicationYear || new Date().getFullYear(),
            category: category || "OTHER",
            description,
            pageCount: pageCount ?? 0,
            language: language || "ENGLISH",
            copiesTotal: 1,
            copiesAvailable: 1,
          },
        })

        return NextResponse.json(book)
      }

      case "create-library-fine": {
        const { institutionId, fineName, description, amount, fineType } = body

        const fine = await prisma.libraryFine.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            fineName,
            description,
            amount,
            fineType: fineType || "OVERDUE",
            isActive: true,
          },
        })

        return NextResponse.json(fine)
      }

      case "create-library-category": {
        const { institutionId, name, description } = body

        const category = await prisma.libraryCategory.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            name,
            description,
            isActive: true,
          },
        })

        return NextResponse.json(category)
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Library API POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper responses
function NextJSON(data: any) {
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}