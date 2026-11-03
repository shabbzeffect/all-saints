import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

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

    const where: any = {}

    if (wing) {
      where.wing = wing
    }
    if (type) {
      where.type = type
    }
    if (status) {
      where.isActive = status === "ACTIVE"
    }
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const dormitories = await prisma.dormitory.findMany({
      where,
      orderBy: { name: "asc" },
    })

    // Calculate occupancy rates
    const withRates = dormitories.map((dorm) => ({
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

    const newDormitory = await prisma.dormitory.create({
      data: {
        name: body.name,
        type: body.type,
        wing: body.wing,
        capacity: body.capacity,
        currentOccupancy: 0,
        isActive: body.isAuto !== false, // Default to active
      },
    })

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
