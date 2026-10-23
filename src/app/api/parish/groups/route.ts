import { NextResponse } from "next/http"

interface ParishGroup {
  id: string
  name: string
  description: string
  type: "CELL" | "BIBLE_STUDY" | "PRAYER" | "OUTREACH" | "SOCIAL" | "OTHER"
  leaderId: string
  leaderName: string
  memberCount: number
  capacity: number
  meetingSchedule: string
  location: string
  status: "ACTIVE" | "INACTIVE" | "DORMANT"
  wing: "PARISH"
  createdAt: string
}

interface GroupFilter {
  type?: "CELL" | "BIBLE_STUDY" | "PRAYER" | "OUTREACH" | "SOCIAL" | "OTHER"
  status?: "ACTIVE" | "INACTIVE" | "DORMANT"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wing = searchParams.get("wing") as "PARISH" || "PARISH"
    const type = searchParams.get("type") as "CELL" | "BIBLE_STUDY" | "PRAYER" | "OUTREACH" | "SOCIAL" | "OTHER" || undefined
    const status = searchParams.get("status") as "ACTIVE" | "INACTIVE" | "DORMANT" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock parish groups
    const mockGroups: ParishGroup[] = [
      {
        id: "grp-001",
        name: "Sunday Cell Group",
        description: "Weekly cell group for fellowship and Bible study",
        type: "CELL",
        leaderId: "leader-001",
        leaderName: "Mary Wang",
        memberCount: 12,
        capacity: 15,
        meetingSchedule: "Wednesdays, 7:00 PM",
        location: "Parish Hall A",
        status: "ACTIVE",
        wing: "PARISH",
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: "grp-002",
        name: "Women's Bible Study",
        description: "Weekly Bible study for women",
        type: "BIBLE_STUDY",
        leaderId: "leader-002",
        leaderName: "Josephine Akumu",
        memberCount: 8,
        capacity: 12,
        meetingSchedule: "Thursdays, 10:00 AM",
        location: "Parish Chapel",
        status: "ACTIVE",
        wing: "PARISH",
        createdAt: new Date(Date.now() - 1209600000).toISOString(),
      },
      {
        id: "grp-003",
        name: "Men's Fellowship",
        description: "Monthly men's fellowship and prayer",
        type: "OUTREACH",
        leaderId: "leader-003",
        leaderName: "Peter Omondi",
        memberCount: 15,
        capacity: 20,
        meetingSchedule: "First Saturday, 9:00 AM",
        location: "Community Center",
        status: "ACTIVE",
        wing: "PARISH",
        createdAt: new Date(Date.now() - 1814400000).toISOString(),
      },
      {
        id: "grp-004",
        name: "Prayer Warriors",
        description: "Dedicated prayer group for the parish",
        type: "PRAYER",
        leaderId: "leader-004",
        leaderName: "Rebecca Achieng",
        memberCount: 5,
        capacity: 10,
        meetingSchedule: "Tuesdays & Thursdays, 6:00 AM",
        location: "Parish Chapel",
        status: "ACTIVE",
        wing: "PARISH",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ]

    let filteredGroups = mockGroups

    if (type) {
      filteredGroups = filteredGroups.filter((g) => g.type === type)
    }
    if (status) {
      filteredGroups = filteredGroups.filter((g) => g.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredGroups = filteredGroups.filter(
        (g) => g.name.toLowerCase().includes(termLower) || g.description.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredGroups,
    })
  } catch (error) {
    console.error("Parish groups error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch parish groups" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new parish group
    const newGroup: ParishGroup = {
      id: `grp-${Date.now().toString(36)}`,
      ...body,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newGroup,
      message: "Parish group created successfully",
    })
  } catch (error) {
    console.error("Create parish group error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create parish group" },
      { status: 500 }
    )
  }
}