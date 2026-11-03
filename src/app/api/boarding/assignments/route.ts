import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

interface RoomAssignment {
  id: string
  roomId: string
  studentId: string
  assignedAt: string
  assignedBy: string
  leaseStart: string
  leaseEnd?: string
  isCurrent: boolean
  rentAmount: number
  studentName: string
  studentAdmission: string
  status: "ACTIVE" | "EXPIRED" | "TERMINATED"
}

interface AssignmentFilter {
  roomId?: string
  studentId?: string
  status?: "ACTIVE" | "EXPIRED" | "TERMINATED"
  isCurrent?: boolean
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status") as "ACTIVE" | "EXPIRED" | "TERMINATED" || undefined
    const isCurrent = searchParams.get("isCurrent") === "true"
    const searchTerm = searchParams.get("search") || ""

    const where: any = {}

    if (roomId) {
      where.roomId = roomId
    }
    if (studentId) {
      where.studentId = studentId
    }
    if (status) {
      where.status = status
    }
    if (isCurrent !== undefined) {
      where.isCurrent = isCurrent
    }
    if (searchTerm) {
      where.OR = [
        { studentName: { contains: searchTerm, mode: "insensitive" } },
        { studentAdmission: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const assignments = await prisma.roomAssignment.findMany({
      where,
      orderBy: { assignedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    console.error("Boarding assignments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newAssignment = await prisma.roomAssignment.create({
      data: {
        roomId: body.roomId,
        studentId: body.studentId,
        assignedAt: new Date().toISOString(),
        assignedBy: body.assignedBy || "admin",
        leaseStart: body.leaseStart,
        leaseEnd: body.leaseEnd,
        isCurrent: body.isCurrent ?? true,
        rentAmount: body.rentAmount,
        studentName: body.studentName,
        studentAdmission: body.studentAdmission,
        status: body.status || "ACTIVE",
      },
    })

    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: "Assignment created successfully",
    })
  } catch (error) {
    console.error("Create assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
