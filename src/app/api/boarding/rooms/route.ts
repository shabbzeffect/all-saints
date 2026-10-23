import { NextResponse } from "next/http"

interface Room {
  id: string
  dormitoryId: string
  roomNumber: string
  roomType: "SINGLE" | "DOUBLE" | "TRIPLE"
  capacity: number
  currentStudents: number
  wing: "SCHOOL" | "PARISH"
  features: string[]
  isActive: boolean
  createdAt: string
}

interface RoomFilter {
  dormitoryId?: string
  roomType?: "SINGLE" | "DOUBLE" | "TRIPLE"
  wing?: "SCHOOL" | "PARISH"
  status?: "ACTIVE" | "FULL"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dormitoryId = searchParams.get("dormitoryId")
    const roomType = searchParams.get("roomType")
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const status = searchParams.get("status") as "ACTIVE" | "FULL" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock room data
    const mockRooms: Room[] = [
      {
        id: "room-001",
        dormitoryId: "dorm-001",
        roomNumber: "R-101",
        roomType: "SINGLE",
        capacity: 1,
        currentStudents: 1,
        wing: "SCHOOL",
        features: ["EN-SUITE"],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "room-002",
        dormitoryId: "dorm-001",
        roomNumber: "R-102",
        roomType: "DOUBLE",
        capacity: 2,
        currentStudents: 2,
        wing: "SCHOOL",
        features: ["EN-SUITE", "AC"],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "room-003",
        dormitoryId: "dorm-001",
        roomNumber: "R-103",
        roomType: "TRIPLE",
        capacity: 3,
        currentStudents: 2,
        wing: "SCHOOL",
        features: ["EN-SUITE"],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "room-004",
        dormitoryId: "dorm-002",
        roomNumber: "R-201",
        roomType: "SINGLE",
        capacity: 1,
        currentStudents: 0,
        wing: "SCHOOL",
        features: [],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "room-005",
        dormitoryId: "dorm-002",
        roomNumber: "R-202",
        roomType: "DOUBLE",
        capacity: 2,
        currentStudents: 1,
        wing: "SCHOOL",
        features: ["AC"],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    let filteredRooms = mockRooms

    if (dormitoryId) {
      filteredRooms = filteredRooms.filter((r) => r.dormitoryId === dormitoryId)
    }
    if (roomType) {
      filteredRooms = filteredRooms.filter((r) => r.roomType === roomType)
    }
    if (wing) {
      filteredRooms = filteredRooms.filter((r) => r.wing === wing)
    }
    if (status) {
      if (status === "ACTIVE") {
        filteredRooms = filteredRooms.filter((r) => r.isActive)
      }
      if (status === "FULL") {
        filteredRooms = filteredRooms.filter((r) => r.currentStudents >= r.capacity && r.isActive)
      }
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredRooms = filteredRooms.filter(
        (r) => r.roomNumber.toLowerCase().includes(termLower)
      )
    }

    // Calculate occupancy rates
    const withRates = filteredRooms.map((room) => ({
      ...room,
      occupancyRate: Math.round((room.currentStudents / room.capacity) * 100),
      isFull: room.currentStudents >= room.capacity,
    }))

    return NextResponse.json({
      success: true,
      data: withRates,
    })
  } catch (error) {
    console.error("Boarding rooms error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new room
    const newRoom: Room = {
      id: `room-${Date.now().toString(36)}`,
      ...body,
      currentStudents: 0,
      isActive: true,
      features: body.features || [],
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newRoom,
      message: "Room created successfully",
    })
  } catch (error) {
    console.error("Create room error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    )
  }
}