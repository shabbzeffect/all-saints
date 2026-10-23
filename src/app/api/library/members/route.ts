import { NextResponse } from "next/http"

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

    // Mock member data
    const mockMembers: Member[] = [
      {
        id: "member-001",
        name: "John Omondi",
        admissionNumber: "ADM-2024-001",
        grade: "Grade 7",
        type: "STUDENT",
        email: "john.omondi@saints.ac.ke",
        phone: "+254712345678",
        address: "Nairobi, Kenya",
        dateJoined: new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0],
        membershipStatus: "ACTIVE",
        booksBorrowed: 2,
        maxBooks: 5,
        finesOutstanding: 0,
      },
      {
        id: "member-002",
        name: "Jane Doe",
        admissionNumber: "ADM-2024-002",
        grade: "Grade 8",
        type: "STUDENT",
        email: "jane.doe@saints.ac.ke",
        phone: "+254712345679",
        address: "Nairobi, Kenya",
        dateJoined: new Date(Date.now() - 300 * 86400000).toISOString().split("T")[0],
        membershipStatus: "ACTIVE",
        booksBorrowed: 1,
        maxBooks: 5,
        finesOutstanding: 0,
      },
      {
        id: "member-003",
        name: "Mr. Joseph Omondi",
        admissionNumber: "TEACH-001",
        grade: "Staff",
        type: "TEACHER",
        email: "joseph.omondi@saints.ac.ke",
        phone: "+254712345670",
        address: "Nairobi, Kenya",
        dateJoined: new Date(Date.now() - 730 * 86400000).toISOString().split("T")[0],
        membershipStatus: "ACTIVE",
        booksBorrowed: 0,
        maxBooks: 3,
        finesOutstanding: 0,
      },
      {
        id: "member-004",
        name: "Parent Association",
        admissionNumber: "PARENT-001",
        grade: "Parent",
        type: "PARENT",
        email: "parent@saints.ac.ke",
        phone: "+254712345677",
        address: "Nairobi, Kenya",
        dateJoined: new Date(Date.now() - 180 * 86400000).toISOString().split("T")[0],
        membershipStatus: "ACTIVE",
        booksBorrowed: 0,
        maxBooks: 2,
        finesOutstanding: 0,
      },
    ]

    let filteredMembers = mockMembers

    if (type) {
      filteredMembers = filteredMembers.filter((m) => m.type === type)
    }
    if (status) {
      filteredMembers = filteredMembers.filter((m) => m.membershipStatus === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredMembers = filteredMembers.filter(
        (m) => m.name.toLowerCase().includes(termLower) ||
        m.admissionNumber.toLowerCase().includes(termLower) ||
        m.email.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredMembers,
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

    // Create new member record
    const newMember: Member = {
      id: `member-${Date.now().toString(36)}`,
      ...body,
      membershipStatus: "ACTIVE",
      booksBorrowed: 0,
      maxBooks: body.maxBooks ?? 5,
      finesOutstanding: 0,
    }

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