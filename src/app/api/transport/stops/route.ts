import { NextResponse } from "next/http"

interface Stop {
  id: string
  name: string
  type: "PICKUP" | "DROPOFF" | "DESIGNATED"
  location: string
  latitude: number
  longitude: number
  orderIndex: number
  isActive: boolean
}

interface StopFilter {
  type?: "PICKUP" | "DROPOFF" | "DESIGNATED"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "PICKUP" | "DROPOFF" | "DESIGNATED" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock stop data
    const mockStops: Stop[] = [
      {
        id: "stop-001",
        name: "School Main Gate",
        type: "PICKUP",
        location: "Main Entrance",
        latitude: -1.2833,
        longitude: 36.8167,
        orderIndex: 1,
        isActive: true,
      },
      {
        id: "stop-002",
        name: "Railways Station",
        type: "DROPOFF",
        location: "Railways Area",
        latitude: -1.2900,
        longitude: 36.8200,
        orderIndex: 2,
        isActive: true,
      },
      {
        id: "stop-003",
        name: "Westlands Roundabout",
        type: "PICKUP",
        location: "Westlands",
        latitude: -1.2950,
        longitude: 36.8300,
        orderIndex: 3,
        isActive: true,
      },
      {
        id: "stop-004",
        name: "Kilimani Market",
        type: "DROPOFF",
        location: "Kilimani",
        latitude: -1.3000,
        longitude: 36.8250,
        orderIndex: 4,
        isActive: true,
      },
    ]

    let filteredStops = mockStops

    if (type) {
      filteredStops = filteredStops.filter((s) => s.type === type)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredStops = filteredStops.filter(
        (s) => s.name.toLowerCase().includes(termLower) ||
        s.location.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredStops,
    })
  } catch (error) {
    console.error("Transport stops error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stops" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new stop record
    const newStop: Stop = {
      id: `stop-${Date.now().toString(36)}`,
      ...body,
      isActive: true,
      orderIndex: body.orderIndex ?? 0,
    }

    return NextResponse.json({
      success: true,
      data: newStop,
      message: "Stop created successfully",
    })
  } catch (error) {
    console.error("Create stop error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create stop" },
      { status: 500 }
    )
  }
}