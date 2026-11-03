import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

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

    const where: any = {}

    if (type) {
      where.type = type
    }
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { location: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const stops = await prisma.stop.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: stops,
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

    const newStop = await prisma.stop.create({
      data: {
        name: body.name,
        type: body.type,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        orderIndex: body.orderIndex ?? 0,
        isActive: body.isActive ?? true,
      },
    })

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
