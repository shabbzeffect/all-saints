import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

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

    const where: any = {
      institutionId: undefined, // Will be set by middleware/auth
    }

    if (status) {
      where.status = status
    }
    if (type) {
      where.fineType = type
    }
    if (searchTerm) {
      where.OR = [
        { fineName: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const fines = await prisma.libraryFine.findMany({
      where,
      orderBy: { dateAssessed: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: fines,
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

    const newFine = await prisma.libraryFine.create({
      data: {
        fineName: body.type,
        description: body.description,
        amount: body.amount,
        fineType: body.type as "OVERDUE" | "LOST" | "DAMAGED",
        isActive: true,
        institutionId: "INSTITUTION_ID_PLACEHOLDER", // Will be set by middleware
      },
    })

    return NextResponse.json({
      success: true,
      data: newFine,
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