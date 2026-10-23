import { NextResponse } from "next/http"

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

    // Mock reservation data
    const mockReservations: Reservation[] = [
      {
        id: "reserve-001",
        bookId: "book-004",
        bookTitle: "Africa's Future",
        memberId: "std-001",
        memberName: "John Omondi",
        memberType: "STUDENT",
        requestedDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        status: "ACTIVE",
      },
      {
        id: "reserve-002",
        bookId: "book-002",
        bookTitle: "A Brief History of Time",
        memberId: "std-002",
        memberName: "Jane Doe",
        memberType: "STUDENT",
        requestedDate: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        status: "ACTIVE",
      },
      {
        id: "reserve-003",
        bookId: "book-001",
        bookTitle: "The Great Gatsby",
        memberId: "std-003",
        memberName: "Peter Omondi",
        memberType: "STUDENT",
        requestedDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
        expiryDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        status: "EXPIRED",
      },
    ]

    let filteredReservations = mockReservations

    if (status) {
      filteredReservations = filteredReservations.filter((r) => r.status === status)
    }
    if (memberType) {
      filteredReservations = filteredReservations.filter((r) => r.memberType === memberType)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredReservations = filteredReservations.filter(
        (r) => r.bookTitle.toLowerCase().includes(termLower) ||
        r.memberName.toLowerCase().includes(termLower) ||
        r.id.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredReservations,
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

    // Create new reservation record
    const newReservation: Reservation = {
      id: `reserve-${Date.now().toString(36)}`,
      ...body,
      requestedDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0], // 14 days default
      status: "ACTIVE",
    }

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