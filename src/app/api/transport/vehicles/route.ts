import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

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

    const where: any = {}

    if (status) {
      where.status = status
    }
    if (vehicleType) {
      where.vehicleType = vehicleType
    }
    if (searchTerm) {
      where.OR = [
        { plateNumber: { contains: searchTerm, mode: "insensitive" } },
        { manufacturer: { contains: searchTerm, mode: "insensitive" } },
        { model: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { year: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: vehicles,
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

    const newVehicle = await prisma.vehicle.create({
      data: {
        plateNumber: body.plateNumber,
        vehicleType: body.vehicleType,
        capacity: body.capacity,
        manufacturer: body.manufacturer,
        model: body.model,
        year: body.year,
        status: body.status || "ACTIVE",
        dailyRate: body.dailyRate,
      },
    })

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
