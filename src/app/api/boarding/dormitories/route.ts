import { NextResponse } from "next/http"

interface Dormitory {
  id: string
  name: string
  type: "BOYS" | "GIRLS" | "MIXED"
  wing: "SCHOOL" | "PARISH"
  capacity: number
  currentOccupancy: number
  isActive: boolean
  createdAt: string
}

interface DormitoryFilter {
  wing?: "SCHOOL" | "PARISH"
  type?: "BOYS" | "GIRLS" | "MIXED"
  status?: "ACTIVE" | "INACTIVE"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const type = searchParams.get("type") as "BOYS" | "GIRLS" | "MIXED" || undefined
    const status = searchParams.get("status") as "ACTIVE" | "INACTIVE" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock dormitory data
    const mockDormitories: Dormitory[] = [
      {
        id: "dorm-001",
        name: "Boys' House",
        type: "BOYS",
        wing: "SCHOOL",
        capacity: 120,
        currentOccupancy: 95,
        isActive: true,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: "dorm-002",
        name: "Girls' House",
        type: "GIRLS",
        wing: "SCHOOL",
        capacity: 110,
        currentOccupancy: 88,
        isActive: true,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: "dorm-003",
        name: "Parish Mixed House",
        type: "MIXED",
        wing: "PARISH",
        capacity: 50,
        currentOccupancy: 42,
        isActive: true,
        createdAt: new Date(Date.now() - 1209600000).toISOString(),
      },
    ]

    let filteredDormitories = mockDormitories

    if (wing) {
      filteredDormitories = filteredDormitories.filter((d) => d.wing === wing)
    }
    if (type) {
      filteredDormitories = filteredDormitories.filter((d) => d.type === type)
    }
    if (status) {
      filteredDormitories = filteredDormitories.filter((d) => d.isActive ? "ACTIVE" : "INACTIVE" === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredDormitories = filteredDormitories.filter(
        (d) => d.name.toLowerCase().includes(termLower)
      )
    }

    // Calculate occupancy rates
    const withRates = filteredDormitories.map((dorm) => ({
      ...dorm,
      occupancyRate: Math.round((dorm.currentOccupancy / dorm.capacity) * 100),
    }))

    return NextResponse.json({
      success: true,
      data: withRates,
    })
  } catch (error) {
    console.error("Boarding dormitories error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dormitories" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new dormitory
    const newDormitory: Dormitory = {
      id: `dorm-${Date.now().toString(36)}`,
      ...body,
      isActive: body.isAuto !== false, // Default to active
      currentOccupancy: 0,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newDormitory,
      message: "Dormitory created successfully",
    })
  } catch (error) {
    console.error("Create dormitory error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create dormitory" },
      { status: 500 }
    )
  }
}