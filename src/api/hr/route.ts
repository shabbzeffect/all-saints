"use server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [staff, leaveRequests, payroll] = await Promise.all([
      // Staff
      prisma.staff.findMany({
        include: {
          role: true,
          employmentType: true,
        },
        orderBy: { dateOfJoining: "desc" },
      }),
      prisma.leaveRequest.findMany({
        include: {
          staff: {
            include: {
              role: true,
              employmentType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payslip.findMany({
        include: {
          staff: {
            include: {
              role: true,
              employmentType: true,
            },
          },
        },
        orderBy: { payDate: "desc" },
      }),
    ])

    // Calculate payroll summary
    const totalPayroll = payroll.reduce(
      (sum, slip) => sum + Number(slip.netSalary),
      0
    )
    const averageSalary = payroll.length > 0
      ? totalPayroll / payroll.length
      : 0

    const totalStaff = staff.length

    return new Response(
      JSON.stringify({
        data: {
          staff,
          leaveRequests,
          payrollSummary: {
            totalPayroll,
            totalStaff,
            averageSalary: Math.round(averageSalary),
          },
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("HR API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch HR data" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
