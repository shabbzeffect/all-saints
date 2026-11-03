import { NextResponse } from "next/server"

interface Assignment {
  id: string
  routeId: string
  vehicleId: string
  studentId: string
  studentName: string
  admissionNumber: string
  stopId: string
  stopName: string
  pickupTime: string
  dropoffTime: string
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  pickupDate: string
  dropoffDate: string
}

interface AssignmentFilter {
  status?: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  vehicleId?: string
  studentId?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED" || undefined
    const vehicleId = searchParams.get("vehicleId") || undefined
    const studentId = searchParams.get("studentId") || undefined
    const searchTerm = searchParams.get("search") || ""

    const where: any = {}

    if (status) {
      where.status = status
    }
    if (vehicleId) {
      where.vehicleId = vehicleId
    }
    if (studentId) {
      where.studentId = studentId
    }
    if (searchTerm) {
      where.OR = [
        { studentName: { contains: searchTerm, mode: "insensitive" } },
        { admissionNumber: { contains: searchTerm, mode: "insensitive" } },
        { stopName: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: { pickupDate: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    console.error("Transport assignments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newAssignment = await prisma.assignment.create({
      data: {
        routeId: body.routeId,
        vehicleId: body.vehicleId,
        studentId: body.studentId,
        studentName: body.studentName,
        admissionNumber: body.admissionNumber,
        stopId: body.stopId,
        stopName: body.stopName,
        pickupTime: body.pickupTime,
        dropoffTime: body.dropoffTime,
        status: body.status || "SCHEDULED",
        pickupDate: body.pickupDate || new Date().toISOString().split("T")[0],
        dropoffDate: body.dropoffDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("Create assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
