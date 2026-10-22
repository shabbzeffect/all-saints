/* eslint-disable react/prop-types */
/* Boarding Module API Routes - SaintsHub */
import { NextResponse } from "next/server"
import { prisma } from "@/src/server/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const dormitoryId = searchParams.get("dormitoryId")
    const vehicleId = searchParams.get("vehicleId")
    const routeId = searchParams.get("routeId")

    switch (action) {
      case "dormitories": {
        const dorms = await prisma.dormitory.findMany({
          where: { institutionId: "inst-school-1" },
          include: {
            roomAssignments: {
              include: { student: { include: { user: true } } },
            },
            dormitoryFees: true,
          },
          orderBy: { name: "asc" },
        })
        return NextResponse.json(dorms)
      }

      case "dormitory-by-id": {
        if (!dormitoryId) {
          return NextResponse.json({ error: "dormitoryId required" }, { status: 400 })
        }
        const dorm = await prisma.dormitory.findUnique({
          where: { id: dormitoryId },
          include: {
            rooms: {
              include: { assignments: { include: { student: { include: { user: true } } } } },
            },
            dormitoryFees: true,
          },
        })
        if (!dorm) {
          return NextResponse.json({ error: "Dormitory not found" }, { status: 404 })
        }
        return NextResponse.json(dorm)
      }

      case "rooms-by-dorm": {
        if (!dormitoryId) {
          return NextResponse.json({ error: "dormitoryId required" }, { status: 400 })
        }
        const rooms = await prisma.room.findMany({
          where: { dormitoryId },
          include: {
            assignments: {
              include: { student: { include: { user: true } } },
            },
          },
          orderBy: { roomNumber: "asc" },
        })
        return NextResponse.json(rooms)
      }

      case "room-assignments-by-room": {
        if (!dormitoryId) {
          return NextResponse.json({ error: "dormitoryId required" }, { status: 400 })
        }
        const assignments = await prisma.roomAssignment.findMany({
          where: { roomId: dormitoryId }, // dormitoryId used as roomId here for simplicity
          include: { student: { include: { user: true } } },
          orderBy: { assignedAt: "desc" },
        })
        return NextResponse.json(assignments)
      }

      case "assign-student-to-room": {
        const { roomId, studentId, leaseStart, leaseEnd, rentAmount, assignedBy } = await request.json()

        const assignment = await prisma.roomAssignment.create({
          data: {
            roomId,
            studentId,
            leaseStart: new Date(leaseStart),
            leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
            rentAmount,
            assignedBy,
            isCurrent: true,
          },
        })

        // Update room current students count
        await prisma.room.update({
          where: { id: roomId },
          data: { currentStudents: { increment: 1 } },
        })

        // Update dormitory current occupancy
        await prisma.dormitory.update({
          where: { id: roomId }, // Assuming roomId maps to dormitory for occupancy
          data: { currentOccupancy: { increment: 1 } },
        })

        return NextResponse.json(assignment)
      }

      case "release-student-from-room": {
        const { assignmentId } = await request.json()

        const assignment = await prisma.roomAssignment.findUnique({
          where: { id: assignmentId },
        })

        if (!assignment) {
          return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        // Update room current students count
        await prisma.room.update({
          where: { id: assignment.roomId },
          data: { currentStudents: { decrement: 1 } },
        })

        // Update dormitory current occupancy
        await prisma.dormitory.update({
          where: { id: assignment.roomId },
          data: { currentOccupancy: { decrement: 1 } },
        })

        // Mark assignment as no longer current
        await prisma.roomAssignment.update({
          where: { id: assignmentId },
          data: { isCurrent: false },
        })

        return NextResponse.json({ success: true })
      }

      case "exeat-requests": {
        const requests = await prisma.exeatPass.findMany({
          where: { studentId: searchParams.get("studentId") },
          include: { student: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(requests)
      }

      case "submit-exeat-request": {
        const { studentId, requestedBy, reason, startDate, endDate } = await request.json()

        const request = await prisma.exeatPass.create({
          data: {
            studentId,
            requestedBy,
            reason,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: "PENDING",
          },
        })

        return NextResponse.json(request)
      }

      case "approve-exeat": {
        const { requestId, approverId } = await request.json()

        const exeat = await prisma.exeatPass.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            approvedBy: approverId,
            approvedAt: new Date(),
          },
        })

        return NextResponse.json(exeat)
      }

      case "reject-exeat": {
        const { requestId } = await request.json()

        const exeat = await prisma.exeatPass.update({
          where: { id: requestId },
          data: { status: "REJECTED" },
        })

        return NextResponse.json(exeat)
      }

      case "boarding-fees": {
        const fees = await prisma.boardingFee.findMany({
          where: { institutionId: "inst-school-1" },
          orderBy: { name: "asc" },
        })
        return NextResponse.json(fees)
      }

      case "vehicles": {
        const vehicles = await prisma.vehicle.findMany({
          where: { institutionId: "inst-school-1" },
          orderBy: { registrationNumber: "asc" },
        })
        return NextResponse.json(vehicles)
      }

      case "vehicle-by-id": {
        if (!vehicleId) {
          return NextResponse.json({ error: "vehicleId required" }, { status: 400 })
        }
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId },
        })
        if (!vehicle) {
          return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }
        return NextResponse.json(vehicle)
      }

      case "routes": {
        const routes = await prisma.route.findMany({
          where: { institutionId: "inst-school-1" },
          include: { stops: true, assignments: { include: { student: { include: { user: true } } } } },
          orderBy: { name: "asc" },
        })
        return NextResponse.json(routes)
      }

      case "route-by-id": {
        if (!routeId) {
          return NextResponse.json({ error: "routeId required" }, { status: 400 })
        }
        const route = await prisma.route.findUnique({
          where: { id: routeId },
          include: { stops: true, assignments: { include: { student: { include: { user: true } } } } },
        })
        if (!route) {
          return NextResponse.json({ error: "Route not found" }, { status: 404 })
        }
        return NextResponse.json(route)
      }

      case "assign-student-to-route": {
        const { routeId, studentId, assignedBy } = await request.json()

        const assignment = await prisma.routeAssignment.create({
          data: {
            routeId,
            studentId,
            assignedBy,
            isCurrent: true,
          },
        })

        return NextResponse.json(assignment)
      }

      case "release-student-from-route": {
        const { assignmentId } = await request.json()

        const assignment = await prisma.routeAssignment.findUnique({
          where: { id: assignmentId },
        })

        if (!assignment) {
          return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        await prisma.routeAssignment.delete({
          where: { id: assignmentId },
        })

        return NextResponse.json({ success: true })
      }

      case "transport-fees": {
        const fees = await prisma.transportFee.findMany({
          where: { institutionId: "inst-school-1" },
          orderBy: { name: "asc" },
        })
        return NextResponse.json(fees)
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Boarding/Transport API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "create-dormitory": {
        const { institutionId, name, type, capacity, wing } = body

        const dorm = await prisma.dormitory.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            name,
            type,
            capacity,
            wing: wing || "SCHOOL",
            isActive: true,
          },
        })

        return NextResponse.json(dorm)
      }

      case "create-room": {
        const { dormitoryId, roomNumber, roomType, capacity, features } = body

        const room = await prisma.room.create({
          data: {
            dormitoryId,
            roomNumber,
            roomType,
            capacity,
            features: features || [],
            isActive: true,
          },
        })

        return NextResponse.json(room)
      }

      case "create-exeat-request": {
        const { studentId, requestedBy, reason, startDate, endDate } = body

        const request = await prisma.exeatPass.create({
          data: {
            studentId,
            requestedBy,
            reason,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: "PENDING",
          },
        })

        return NextResponse.json(request)
      }

      case "create-boarding-fee": {
        const { institutionId, name, description, amount, isMandatory, applicableGrades, wing } = body

        const fee = await prisma.boardingFee.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            name,
            description,
            amount,
            isMandatory,
            applicableGrades: applicableGrades || [],
            wing: wing || "SCHOOL",
            isActive: true,
          },
        })

        return NextResponse.json(fee)
      }

      case "create-vehicle": {
        const { institutionId, registrationNumber, model, year, fuelType, capacity, licenseExpires, insuranceExpires, notes } = body

        const vehicle = await prisma.vehicle.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            registrationNumber,
            model,
            year,
            fuelType,
            capacity,
            licenseExpires: licenseExpires ? new Date(licenseExpires) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            insuranceExpires: insuranceExpires ? new Date(insuranceExpires) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            notes,
            isActive: true,
          },
        })

        return NextResponse.json(vehicle)
      }

      case "create-route": {
        const { institutionId, name, description, wing } = body

        const route = await prisma.route.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            name,
            description,
            wing: wing || "SCHOOL",
            isActive: true,
          },
        })

        return NextResponse.json(route)
      }

      case "create-route-stop": {
        const { routeId, stopName, order, latitude, longitude, contactPhone, timeWindow } = body

        const stop = await prisma.routeStop.create({
          data: {
            routeId,
            stopName,
            order: order ?? 1,
            latitude,
            longitude,
            contactPhone,
            timeWindow,
            isActive: true,
          },
        })

        return NextResponse.json(stop)
      }

      case "create-transport-fee": {
        const { institutionId, name, description, amount, isMandatory, applicableGrades, wing } = body

        const fee = await prisma.transportFee.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            name,
            description,
            amount,
            isMandatory,
            applicableGrades: applicableGrades || [],
            wing: wing || "SCHOOL",
            isActive: true,
          },
        })

        return NextResponse.json(fee)
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Boarding/Transport API POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper responses
function NextJSON(data: any) {
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}