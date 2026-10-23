import { NextResponse } from "next/http"

interface Route {
  id: string
  name: string
  origin: string
  destination: string
  waypoints: string[]
  distanceKm: number
  estimatedTimeMinutes: number
  status: "ACTIVE" | "INACTIVE"
  assignedVehicleId?: string
}

interface RouteFilter {
  status?: "ACTIVE" | "INACTIVE"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "ACTIVE" | "INACTIVE" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock route data
    const mockRoutes: Route[] = [
      {
        id: "route-001",
        name: "Morning Express",
        origin: "School Main Gate",
        destination: "Railways",
        waypoints: ["Kilimani", "Westlands"],
        distanceKm: 12.5,
        estimatedTimeMinutes: 35,
        status: "ACTIVE",
        assignedVehicleId: "veh-001",
      },
      {
        id: "route-002",
        name: "Afternoon Shuttle",
        origin: "Railways",
        destination: "Kilimani",
        waypoints: ["Westlands", "Kilimani"],
        distanceKm: 12.5,
        estimatedTimeMinutes: 35,
        status: "ACTIVE",
        assignedVehicleId: "veh-002",
      },
      {
        id: "route-003",
        name: "Weekend Service",
        origin: "School Main Gate",
        destination: "CBD",
        waypoints: ["Westlands", "Nairobi"],
        distanceKm: 18,
        estimatedTimeMinutes: 50,
        status: "INACTIVE",
        assignedVehicleId: undefined,
      },
    ]

    let filteredRoutes = mockRoutes

    if (status) {
      filteredRoutes = filteredRoutes.filter((r) => r.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredRoutes = filteredRoutes.filter(
        (r) => r.name.toLowerCase().includes(termLower) ||
        r.origin.toLowerCase().includes(termLower) ||
        r.destination.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredRoutes,
    })
  } catch (error) {
    console.error("Transport routes error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch routes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new route record
    const newRoute: Route = {
      id: `route-${Date.now().toString(36)}`,
      ...body,
      status: "ACTIVE",
    }

    return NextResponse.json({
      success: true,
      data: newRoute,
      message: "Route created successfully",
    })
  } catch (error) {
    console.error("Create route error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create route" },
      { status: 500 }
    )
  }
}