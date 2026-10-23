import { NextResponse } from "next/http"

interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehiclePlate: string
  type: "SERVICE" | "REPAIR" | "INSPECTION" | "EMERGENCY"
  description: string
  reportedDate: string
  scheduledDate: string
  completedDate?: string
  cost?: number
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  mechanic?: string
  partsUsed?: string[]
}

interface MaintenanceFilter {
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  type?: "SERVICE" | "REPAIR" | "INSPECTION" | "EMERGENCY"
  vehicleId?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" || undefined
    const type = searchParams.get("type") as "SERVICE" | "REPAIR" | "INSPECTION" | "EMERGENCY" || undefined
    const vehicleId = searchParams.get("vehicleId") || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock maintenance data
    const mockMaintenance: MaintenanceRecord[] = [
      {
        id: "maint-001",
        vehicleId: "veh-001",
        vehiclePlate: "KBA 123F",
        type: "SERVICE",
        description: "Routine 10,000km service",
        reportedDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
        scheduledDate: new Date().toISOString().split("T")[0],
        cost: 15000,
        status: "PENDING",
        mechanic: "Main Workshop",
        partsUsed: ["Oil Filter", "Air Filter", "Brake Pads"],
      },
      {
        id: "maint-002",
        vehicleId: "veh-003",
        vehiclePlate: "KBD 789H",
        type: "REPAIR",
        description: "Fuel pump replacement",
        reportedDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
        scheduledDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
        completedDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
        cost: 25000,
        status: "COMPLETED",
        mechanic: "Auto Electrical",
        partsUsed: ["Fuel Pump", "Filter Kit"],
      },
      {
        id: "maint-003",
        vehicleId: "veh-002",
        vehiclePlate: "KBC 456G",
        type: "INSPECTION",
        description: "Monthly safety inspection",
        reportedDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
        scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        cost: 8000,
        status: "IN_PROGRESS",
        mechanic: "Service Center",
      },
    ]

    let filteredMaintenance = mockMaintenance

    if (status) {
      filteredMaintenance = filteredMaintenance.filter((m) => m.status === status)
    }
    if (type) {
      filteredMaintenance = filteredMaintenance.filter((m) => m.type === type)
    }
    if (vehicleId) {
      filteredMaintenance = filteredMaintenance.filter((m) => m.vehicleId === vehicleId)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredMaintenance = filteredMaintenance.filter(
        (m) => m.description.toLowerCase().includes(termLower) ||
        m.vehiclePlate.toLowerCase().includes(termLower) ||
        (m.mechanic && m.mechanic.toLowerCase().includes(termLower))
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredMaintenance,
    })
  } catch (error) {
    console.error("Transport maintenance error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch maintenance records" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new maintenance record
    const newMaintenance: MaintenanceRecord = {
      id: `maint-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
    }

    return NextResponse.json({
      success: true,
      data: newMaintenance,
      message: "Maintenance record created successfully",
    })
  } catch (error) {
    console.error("Create maintenance error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create maintenance record" },
      { status: 500 }
    )
  }
}