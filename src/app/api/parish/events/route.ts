import { NextResponse } from "next/http"

interface ParishEvent {
  id: string
  title: string
  description: string
  type: "SERVICE" | "CELEBRATION" | "MEETING" | "OUTREACH" | "WORKSHOP" | "OTHER"
  wing: "PARISH"
  startDate: string
  endDate?: string
  startTime: string
  endTime: string
  location: string
  capacity?: number
  currentAttendees: number
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  organizer: string
  metadata?: {
    imageUrl?: string
    locationNotes?: string
  }
}

interface EventFilter {
  type?: "SERVICE" | "CELEBRATION" | "MEETING" | "OUTREACH" | "WORKSHOP" | "OTHER"
  status?: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "SERVICE" | "CELEBRATION" | "MEETING" | "OUTREACH" | "WORKSHOP" | "OTHER" || undefined
    const status = searchParams.get("status") as "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock events
    const mockEvents: ParishEvent[] = [
      {
        id: "event-001",
        title: "Sunday Morning Service",
        description: "Weekly worship service with communion",
        type: "SERVICE",
        wing: "PARISH",
        startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        startTime: "09:00 AM",
        endTime: "11:00 AM",
        location: "Main Church",
        capacity: 200,
        currentAttendees: 156,
        status: "COMPLETED",
        organizer: "Reverend Paul Kiptoo",
      },
      {
        id: "event-002",
        title: "Midweek Prayer Meeting",
        description: "Weekly prayer and fellowship",
        type: "MEETING",
        wing: "PARISH",
        startDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
        endDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
        startTime: "07:00 PM",
        endTime: "09:00 PM",
        location: "Parish Chapel",
        capacity: 50,
        currentAttendees: 34,
        status: "SCHEDULED",
        organizer: "Reverend Paul Kiptoo",
      },
      {
        id: "event-003",
        title: "Harvest Thanksgiving",
        description: "Annual harvest thanksgiving service",
        type: "CELEBRATION",
        wing: "PARISH",
        startDate: new Date(Date.now() - 259200000).toISOString().split("T")[0],
        endDate: new Date(Date.now() - 259200000).toISOString().split("T")[0],
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        location: "Church grounds",
        capacity: 300,
        currentAttendees: 280,
        status: "COMPLETED",
        organizer: "Reverend Paul Kiptoo",
      },
      {
        id: "event-004",
        title: "Community Outreach - Moshi",
        description: "Food distribution and medical camp",
        type: "OUTREACH",
        wing: "PARISH",
        startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        startTime: "09:00 AM",
        endTime: "04:00 PM",
        location: "Moshi Market",
        capacity: 50,
        currentAttendees: 12,
        status: "SCHEDULED",
        organizer: "John Omondi",
      },
    ]

    let filteredEvents = mockEvents

    if (type) {
      filteredEvents = filteredEvents.filter((e) => e.type === type)
    }
    if (status) {
      filteredEvents = filteredEvents.filter((e) => e.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredEvents = filteredEvents.filter(
        (e) => e.title.toLowerCase().includes(termLower) || e.description.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredEvents,
    })
  } catch (error) {
    console.error("Parish events error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new event
    const newEvent: ParishEvent = {
      id: `event-${Date.now().toString(36)}`,
      ...body,
      status: "SCHEDULED",
      currentAttendees: 0,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: "Event created successfully",
    })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    )
  }
}