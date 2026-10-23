import { NextResponse } from "next/http"

interface ParishMember {
  id: string
  name: string
  email: string
  phone: string
  role: "DEACON" | "ELDER" | "MEMBER" | "LEADER" | "VISITOR"
  wing: "PARISH"
  joinDate: string
  status: "ACTIVE" | "INACTIVE" | "TRANSFERRED"
  membershipType: "REGULAR" | "ASSOCIATE" | "SPONSOR"
  notes?: string
}

interface MemberFilter {
  role?: "DEACON" | "ELDER" | "MEMBER" | "LEADER" | "VISITOR"
  status?: "ACTIVE" | "INACTIVE" | "TRANSFERRED"
  membershipType?: "REGULAR" | "ASSOCIATE" | "SPONSOR"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as "DEACON" | "ELDER" | "MEMBER" | "LEADER" | "VISITOR" || undefined
    const status = searchParams.get("status") as "ACTIVE" | "INACTIVE" | "TRANSFERRED" || undefined
    const membershipType = searchParams.get("membershipType") as "REGULAR" | "ASSOCIATE" | "SPONSOR" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock members
    const mockMembers: ParishMember[] = [
      {
        id: "member-001",
        name: "Mary Wang",
        email: "mary.wang@email.com",
        phone: "+254712345678",
        role: "DEACON",
        wing: "PARISH",
        joinDate: new Date(Date.now() - 604800000).toISOString(),
        status: "ACTIVE",
        membershipType: "REGULAR",
      },
      {
        id: "member-002",
        name: "Josephine Akumu",
        email: "josephine@email.com",
        phone: "+254723456789",
        role: "ELDER",
        wing: "PARISH",
        joinDate: new Date(Date.now() - 1209600000).toISOString(),
        status: "ACTIVE",
        membershipType: "REGULAR",
      },
      {
        id: "member-003",
        name: "Peter Omondi",
        email: "peter@email.com",
        phone: "+254734567890",
        role: "MEMBER",
        wing: "PARISH",
        joinDate: new Date(Date.now() - 1814400000).toISOString(),
        status: "ACTIVE",
        membershipType: "ASSOCIATE",
      },
      {
        id: "member-004",
        name: "Rebecca Achieng",
        email: "rebecca@email.com",
        phone: "+254745678901",
        role: "LEADER",
        wing: "PARISH",
        joinDate: new Date(Date.now() - 259200000).toISOString(),
        status: "INACTIVE",
        membershipType: "SPONSOR",
      },
    ]

    let filteredMembers = mockMembers

    if (role) {
      filteredMembers = filteredMembers.filter((m) => m.role === role)
    }
    if (status) {
      filteredMembers = filteredMembers.filter((m) => m.status === status)
    }
    if (membershipType) {
      filteredMembers = filteredMembers.filter((m) => m.membershipType === membershipType)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredMembers = filteredMembers.filter(
        (m) => m.name.toLowerCase().includes(termLower) || m.email.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredMembers,
    })
  } catch (error) {
    console.error("Parish members error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Add new member
    const newMember: ParishMember = {
      id: `member-${Date.now().toString(36)}`,
      ...body,
      status: "ACTIVE",
      joinDate: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newMember,
      message: "Member added successfully",
    })
  } catch (error) {
    console.error("Add member error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add member" },
      { status: 500 }
    )
  }
}