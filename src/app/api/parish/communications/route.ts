import { NextResponse } from "next/http"

interface Communication {
  id: string
  title: string
  type: "ANNOUNCEMENT" | "EVENT" | "NEWS" | "ANNOUNCEMENT"
  content: string
  author: string
  publishedAt: string
  wing: "SCHOOL" | "PARISH"
  targetAudience: "ALL" | "PARENTS" | "STAFF" | "STUDENTS" | "MEMBERS"
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  metadata?: {
    imageUrl?: string
    readCount?: number
    commentCount?: number
  }
}

interface CommunicationFilter {
  wing?: "SCHOOL" | "PARISH"
  type?: "ANNOUNCEMENT" | "EVENT" | "NEWS"
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const type = searchParams.get("type") as "ANNOUNCEMENT" | "EVENT" | "NEWS" || undefined
    const status = searchParams.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock communications data
    const mockCommunications: Communication[] = [
      {
        id: "comm-001",
        title: "End of Term 1 Examination Schedule",
        type: "ANNOUNCEMENT",
        content: "The end of term 1 examinations will commence on Monday, 1st December 2024. Please see the attached timetable for details.",
        author: "Mr. Joseph Omondi",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        wing: "SCHOOL",
        targetAudience: "STUDENTS",
        status: "PUBLISHED",
      },
      {
        id: "comm-002",
        title: "Parent-Teacher Conference - December 2024",
        type: "ANNOUNCEMENT",
        content: "All parents are invited to the parent-teacher conference on Saturday, 14th December 2024, 9:00 AM - 12:00 PM at the school hall.",
        author: "Mrs. Jane Awuor",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        wing: "SCHOOL",
        targetAudience: "PARENTS",
        status: "PUBLISHED",
      },
      {
        id: "comm-003",
        title: "Weekly Prayer Meeting",
        type: "EVENT",
        content: "Join us for the weekly prayer meeting every Wednesday at 7:00 PM at the parish chapel. All are welcome.",
        author: "Reverend Paul Kiptoo",
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        wing: "PARISH",
        targetAudience: "MEMBERS",
        status: "PUBLISHED",
      },
      {
        id: "comm-004",
        title: "Harvest Thanksgiving Service",
        type: "EVENT",
        content: "Our annual harvest thanksgiving service will be held on Sunday, 20th October 2024 at 10:00 AM. Donations of non-perishable food items are welcome.",
        author: "Reverend Paul Kiptoo",
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        wing: "PARISH",
        targetAudience: "ALL",
        status: "PUBLISHED",
      },
    ]

    let filteredComm = mockCommunications

    if (wing) {
      filteredComm = filteredComm.filter((c) => c.wing === wing)
    }
    if (type) {
      filteredComm = filteredComm.filter((c) => c.type === type)
    }
    if (status) {
      filteredComm = filteredComm.filter((c) => c.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredComm = filteredComm.filter(
        (c) => c.title.toLowerCase().includes(termLower) || c.content.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredComm,
    })
  } catch (error) {
    console.error("Parish communications error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch communications" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new communication
    const newCommunication: Communication = {
      id: `comm-${Date.now().toString(36)}`,
      ...body,
      status: "DRAFT",
      publishedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newCommunication,
      message: "Communication created successfully",
    })
  } catch (error) {
    console.error("Create communication error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create communication" },
      { status: 500 }
    )
  }
}