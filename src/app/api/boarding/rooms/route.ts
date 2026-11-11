import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

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
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    const dormitoryId = searchParams.get("dormitoryId")
    const roomType = searchParams.get("roomType")
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const status = searchParams.get("status") as "ACTIVE" | "FULL" || undefined
    const searchTerm = searchParams.get("search") || ""

    const where: any = { dormitory: { institutionId: membership.institutionId } }

    if (dormitoryId) {
      where.dormitoryId = dormitoryId
    }
    if (roomType) {
      where.roomType = roomType
    }
    if (wing) {
      where.wing = wing
    }
    if (status) {
      if (status === "ACTIVE") {
        where.isActive = true
      }
      // status === "FULL": cross-field comparison (currentStudents >= capacity)
      // can't be expressed in a Prisma where clause — filter in memory below
    }
    if (searchTerm) {
      where.OR = [
        { roomNumber: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { roomNumber: "asc" },
    }).then((rows) =>
      status === "FULL" ? rows.filter((room) => room.currentStudents >= room.capacity) : rows
    )

    // Calculate occupancy rates
    const withRates = rooms.map((room) => ({
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
  const gate = await requireAccess("portal:staff:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const body = await request.json()

    const dormitory = await prisma.dormitory.findFirst({ where: { id: body.dormitoryId, institutionId: membership.institutionId } })
    if (!dormitory) {
      return NextResponse.json({ success: false, error: "Dormitory not found in this institution" }, { status: 404 })
    }

    const newRoom = await prisma.room.create({
      data: {
        dormitoryId: body.dormitoryId,
        roomNumber: body.roomNumber,
        roomType: body.roomType,
        capacity: body.capacity,
        currentStudents: 0,
        wing: body.wing,
        features: body.features || [],
        isActive: true,
      },
    })

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

