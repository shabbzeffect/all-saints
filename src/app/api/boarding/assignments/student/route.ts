import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePermission, scopedInstitutionId } from "@/server/rbac"
import type { InvoiceStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const DAY_MS = 86_400_000

const billingStatus = (status: InvoiceStatus): "PENDING" | "PAID" | "OVERDUE" =>
  status === "PAID" ? "PAID" : status === "OVERDUE" ? "OVERDUE" : "PENDING"

export async function GET(request: Request) {
  try {
    const permissionCheck = await requirePermission("portal:staff:read")
    if (permissionCheck) return permissionCheck

    const institutionId = await scopedInstitutionId()
    if (!institutionId) {
      return NextResponse.json({ success: false, error: "No active membership" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")?.trim() ?? ""
    const admissionNumber = searchParams.get("admissionNumber")?.trim() ?? ""
    if (!studentId && !admissionNumber) {
      return NextResponse.json({ success: false, error: "studentId or admissionNumber is required" }, { status: 400 })
    }

    const student = await prisma.student.findFirst({
      where: { institutionId, ...(studentId ? { id: studentId } : { admissionNumber }) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        grade: { select: { name: true } },
      },
    })
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found in this institution" }, { status: 404 })
    }

    const assignment = await prisma.roomAssignment.findFirst({
      where: { studentId: student.id, isCurrent: true, room: { dormitory: { institutionId } } },
      include: { room: { select: { roomNumber: true, dormitory: { select: { name: true } } } } },
    })

    const billingLines = await prisma.invoiceLine.findMany({
      where: { feeItem: { type: "BOARDING" }, invoice: { studentId: student.id, institutionId } },
      include: {
        feeItem: { select: { id: true, name: true } },
        invoice: {
          include: {
            term: { select: { name: true, academicYear: { select: { name: true } } } },
            payments: { include: { receipt: { select: { receiptNumber: true } } }, orderBy: { transactionDate: "desc" as const } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    const studentName = `${student.firstName} ${student.lastName}`.trim()

    const currentAssignment = assignment
      ? {
          id: assignment.id,
          roomId: assignment.roomId,
          roomNumber: assignment.room.roomNumber,
          dormitoryName: assignment.room.dormitory.name,
          studentId: student.id,
          studentName,
          admissionNumber: student.admissionNumber ?? "",
          grade: student.grade?.name ?? "(unassigned)",
          leaseStart: assignment.leaseStart.toISOString().slice(0, 10),
          leaseEnd: assignment.leaseEnd ? assignment.leaseEnd.toISOString().slice(0, 10) : null,
          isCurrent: assignment.isCurrent,
          rentAmount: assignment.rentAmount,
          daysRemaining: assignment.leaseEnd ? Math.max(0, Math.ceil((assignment.leaseEnd.getTime() - Date.now()) / DAY_MS)) : null,
          status: "ACTIVE" as const,
        }
      : null

    const billingHistory = billingLines.map((line) => {
      const inv = line.invoice
      const latestPayment = inv.payments[0]
      return {
        id: line.id,
        invoiceId: inv.id,
        feeItemId: line.feeItem.id,
        feeName: line.feeItem.name,
        amount: Math.round(Number(line.lineAmount) / 100),
        period: inv.term ? `${inv.term.name} ${inv.term.academicYear.name}` : "—",
        dueDate: inv.dueDate.toISOString().slice(0, 10),
        status: billingStatus(inv.status),
        paidDate: latestPayment?.transactionDate.toISOString(),
        paymentMethod: latestPayment?.method,
        receiptNumber: latestPayment?.receipt?.receiptNumber,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          studentName,
          admissionNumber: student.admissionNumber ?? "",
          grade: student.grade?.name ?? "(unassigned)",
        },
        currentAssignment,
        billingHistory,
      },
    })
  } catch (error) {
    console.error("Student boarding profile GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch student boarding profile" }, { status: 500 })
  }
}
