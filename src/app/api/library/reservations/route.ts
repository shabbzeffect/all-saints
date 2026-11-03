import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

interface Reservation {
  id: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  memberType: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  requestedDate: string
  expiryDate: string
  status: "ACTIVE" | "FULFILLED" | "EXPIRED" | "CANCELLED"
}

interface ReservationFilter {
  status?: "ACTIVE" | "FULFILLED" | "EXPIRED" | "CANCELLED"
  memberType?: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "ACTIVE" | "FULFILLED" | "EXPIRED" | "CANCELLED" || undefined
    const memberType = searchParams.get("memberType") || undefined
    const searchTerm = searchParams.get("search") || ""

    const where: any = {
      institutionId: undefined, // Will be set by middleware/auth
    }

    if (status) {
      where.status = status
    }
    if (memberType) {
      where.OR = [
        { student: { type: memberType } },
      ]
    }
    if (searchTerm) {
      where.OR = [
        { book: { title: { contains: searchTerm, mode: "insensitive" } } },
        { student: { name: { contains: searchTerm, mode: "insensitive" } } },
      ]
    }

    const reservations = await prisma.reserveRecord.findMany({
      where,
      orderBy: { requestedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: reservations,
    })
  } catch (error) {
    console.error("Library reservations error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservations" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newReservation = await prisma.reserveRecord.create({
      data: {
        bookId: body.bookId,
        studentId: body.memberId,
        requestedAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 days default
        status: "ACTIVE",
        institutionId: "INSTITUTION_ID_PLACEHOLDER", // Will be set by middleware
      },
    })

    return NextResponse.json({
      success: true,
      data: newReservation,
      message: "Reservation created successfully",
    })
  } catch (error) {
    console.error("Create reservation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create reservation" },
      { status: 500 }
    )
  }
}