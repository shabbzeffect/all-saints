import { NextResponse } from "next/http"

interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: "BUS" | "VAN" | "CAR"
  capacity: number
  manufacturer: string
  model: string
  year: number
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED"
  dailyRate: number
}

interface VehicleFilter {
  status?: "ACTIVE" | "MAINTENANCE" | "RETIRED"
  vehicleType?: "BUS" | "VAN" | "CAR"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "ACTIVE" | "MAINTENANCE" | "RETIRED" || undefined
    const vehicleType = searchParams.get("vehicleType") as "BUS" | "VAN" | "CAR" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock vehicle data
    const mockVehicles: Vehicle[] = [
      {
        id: "veh-001",
        plateNumber: "KBA 123F",
        vehicleType: "BUS",
        capacity: 60,
        manufacturer: "Toyota",
        model: "Coaster",
        year: 2018,
        status: "ACTIVE",
        dailyRate: 15000,
      },
      {
        id: "veh-002",
        plateNumber: "KBC 456G",
        vehicleType: "VAN",
        capacity: 15,
        manufacturer: "Isuzu",
        model: "N-Series",
        year: 2020,
        status: "ACTIVE",
        dailyRate: 8000,
      },
      {
        id: "veh-003",
        plateNumber: "KBD 789H",
        vehicleType: "BUS",
        capacity: 50,
        manufacturer: "Mitsubishi",
        model: "Rosa",
        year: 2019,
        status: "MAINTENANCE",
        dailyRate: 12000,
      },
    ]

    let filteredVehicles = mockVehicles

    if (status) {
      filteredVehicles = filteredVehicles.filter((v) => v.status === status)
    }
    if (vehicleType) {
      filteredVehicles = filteredVehicles.filter((v) => v.vehicleType === vehicleType)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredVehicles = filteredVehicles.filter(
        (v) => v.plateNumber.toLowerCase().includes(termLower) ||
        v.manufacturer.toLowerCase().includes(termLower) ||
        v.model.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredVehicles,
    })
  } catch (error) {
    console.error("Transport vehicles error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicles" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new vehicle record
    const newVehicle: Vehicle = {
      id: `veh-${Date.now().toString(36)}`,
      ...body,
      status: "ACTIVE",
    }

    return NextResponse.json({
      success: true,
      data: newVehicle,
      message: "Vehicle created successfully",
    })
  } catch (error) {
    console.error("Create vehicle error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create vehicle" },
      { status: 500 }
    )
  }
}