import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

interface Member {
  id: string
  name: string
  admissionNumber: string
  grade: string
  type: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  email: string
  phone: string
  address: string
  dateJoined: string
  membershipStatus: "ACTIVE" | "EXPIRED" | "SUSPENDED"
  booksBorrowed: number
  maxBooks: number
  finesOutstanding: number
}

interface MemberFilter {
  type?: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  status?: "ACTIVE" | "EXPIRED" | "SUSPENDED"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "STUDENT" | "TEACHER" | "STAFF" | "PARENT" || undefined
    const status = searchParams.get("status") as "ACTIVE" | "EXPIRED" | "SUSPENDED" || undefined
    const searchTerm = searchParams.get("search") || ""

    const where: any = {
      institutionId: undefined, // Will be set by middleware/auth
    }

    if (type) {
      where.type = type
    }
    if (status) {
      where.membershipStatus = status
    }
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { admissionNumber: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error("Library members error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newMember = await prisma.member.create({
      data: {
        name: body.name,
        admissionNumber: body.admissionNumber,
        grade: body.grade,
        type: body.type,
        email: body.email,
        phone: body.phone,
        address: body.address,
        dateJoined: body.dateJoined ? new Date(body.dateJoined) : new Date(),
        membershipStatus: "ACTIVE",
        booksBorrowed: 0,
        maxBooks: body.maxBooks ?? 5,
        finesOutstanding: 0,
        institutionId: "INSTITUTION_ID_PLACEHOLDER", // Will be set by middleware
      },
    })

    return NextResponse.json({
      success: true,
      data: newMember,
      message: "Member added successfully",
    })
  } catch (error) {
    console.error("Create member error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create member" },
      { status: 500 }
    )
  }
}