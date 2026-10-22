/* eslint-disable react/prop-types */
/* HR & Payroll API Routes - SaintsHub */
import { NextResponse } from "next/server"
import { prisma } from "@/src/server/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const staffId = searchParams.get("staffId")
    const leaveTypeId = searchParams.get("leaveTypeId")

    switch (action) {
      case "staff": {
        const staff = await prisma.staff.findMany({
          where: { institutionId: "inst-school-1" },
          include: {
            user: { select: { id: true, email: true, name: true, phone: true } },
            role: true,
            employmentType: true,
            _count: {
              select: {
                leaveRequests: { where: { status: "APPROVED" } },
                payslips: true,
              },
            },
          },
          orderBy: { dateOfJoining: "desc" },
        })
        return NextResponse.json(staff)
      }

      case "staff-by-id": {
        if (!staffId) {
          return NextResponse.json({ error: "staffId required" }, { status: 400 })
        }
        const staff = await prisma.staff.findUnique({
          where: { id: staffId },
          include: {
            user: { select: { id: true, email: true, name: true, phone: true } },
            role: true,
            employmentType: true,
            leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
            _count: { select: { payslips: true } },
          },
        })
        if (!staff) {
          return NextResponse.json({ error: "Staff not found" }, { status: 404 })
        }
        return NextResponse.json(staff)
      }

      case "leave-types": {
        const types = await prisma.leaveType.findMany({
          where: { institutionId: "inst-school-1" },
          orderBy: { name: "asc" },
        })
        return NextResponse.json(types)
      }

      case "leave-requests": {
        const requests = await prisma.leaveRequest.findMany({
          where: { staffId },
          include: {
            leaveType: true,
            staff: {
              include: { user: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(requests)
      }

      case "leave-balance": {
        if (!staffId) {
          return NextResponse.json({ error: "staffId required" }, { status: 400 })
        }

        // Get total approved days per leave type
        const balance = await prisma.leaveRequest.aggregate({
          where: {
            staffId,
            status: "APPROVED",
          },
          _sum: { daysRequested: true },
        })

        // Get leave type definitions
        const leaveTypes = await prisma.leaveType.findMany({
          where: { institutionId: "inst-school-1" },
        })

        const result = leaveTypes.map((lt) => {
          const approved = balance._sum.daysRequested || 0
          const perYear = lt.daysPerYear
          return {
            key: lt.key,
            name: lt.name,
            daysPerYear: perYear,
            daysUsed: approved,
            daysRemaining: perYear - approved,
          }
        })

        return NextResponse.json(result)
      }

      case "payroll-stats": {
        const stats = await prisma.payslip.aggregate({
          where: { staffId },
          _sum: { basicSalary: true, grossSalary: true, netSalary: true, totalDeductions: true },
          _count: true,
        })
        return NextResponse.json(stats)
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("HR API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "create-staff": {
        const {
          institutionId,
          userId,
          roleId,
          employmentType,
          dateOfJoining,
          dateOfBirth,
          phone,
          address,
          emergencyContact,
          emergencyPhone,
        } = params

        const staff = await prisma.staff.create({
          data: {
            institutionId: institutionId || "inst-school-1",
            userId,
            roleId,
            employmentType,
            dateOfJoining: new Date(dateOfJoining),
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            phone: phone || "+254700000000",
            address,
            emergencyContact: emergencyContact || [],
            emergencyPhone: emergencyPhone || "",
            status: "ACTIVE",
          },
        })

        // Create default leave balances
        const leaveTypes = await prisma.leaveType.findMany({
          where: { institutionId: staff.institutionId },
        })

        for (const lt of leaveTypes) {
          await prisma.leaveRequest.create({
            data: {
              staffId: staff.id,
              leaveTypeId: lt.id,
              startDate: new Date(dateOfJoining),
              endDate: new Date(dateOfJoining),
              daysRequested: 0,
              status: "PENDING",
            },
          })
        }

        return NextResponse.json(staff)
      }

      case "submit-leave-request": {
        const { staffId, leaveTypeId, startDate, endDate, daysRequested, reason } = params

        // Check balance
        const leaveType = await prisma.leaveType.findUnique({
          where: { id: leaveTypeId },
        })

        const alreadyUsed = await prisma.leaveRequest.aggregate({
          where: {
            staffId,
            leaveTypeId,
            status: "APPROVED",
          },
          _sum: { daysRequested: true },
        })

        const maxDays = leaveType?.daysPerYear || 21
        const currentUsed = (alreadyUsed._sum.daysRequested || 0)
        const remaining = maxDays - currentUsed

        if (daysRequested > remaining) {
          return NextResponse.json(
            { error: `Insufficient balance. Remaining: ${remaining} days` },
            { status: 400 }
          )
        }

        const request = await prisma.leaveRequest.create({
          data: {
            staffId,
            leaveTypeId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            daysRequested,
            status: "PENDING",
            reason,
          },
        })

        return NextResponse.json(request)
      }

      case "approve-leave": {
        const { requestId, approverId } = params

        const request = await prisma.leaveRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            approvedBy: approverId,
            approvedAt: new Date(),
          },
        })

        return NextResponse.json(request)
      }

      case "reject-leave": {
        const { requestId } = params

        const request = await prisma.leaveRequest.update({
          where: { id: requestId },
          data: { status: "REJECTED" },
        })

        return NextResponse.json(request)
      }

      case "generate-payslip": {
        const { staffId, periodStart, periodEnd, basicSalary } = params

        // Get staff basic info
        const staff = await prisma.staff.findUnique({
          where: { id: staffId },
          include: { role: true, employmentType: true },
        })

        // Get statutory deduction rates for the institution/year
        const dedn = await prisma.statutoryDeduction.findFirst({
          where: { institutionId: staff?.institutionId },
          orderBy: { year: "desc" },
        })

        if (!dedn) {
          return NextResponse.json(
            { error: "No statutory deduction config found" },
            { status: 404 }
          )
        }

        // Calculate PAYE (progressive tax bands)
        const grossSalary = basicSalary  // In real app, add allowances/overtime
        let payeAmount = 0

        for (const band of dedn.payeBands) {
          if (grossSalary >= band.minSalary) {
            const taxableInBand = Math.min(
              grossSalary,
              band.maxSalary ?? grossSalary + 1
            ) - band.minSalary
            payeAmount += taxableInBand * band.rate
          }
        }

        // Calculate NSSF (6% employee + 6% employer, max 18,000 each)
        const nssfEmployee = Math.min(grossSalary * 0.06, dedn.nssfRate.maxMonthly)
        const nssfEmployer = Math.min(grossSalary * 0.06, dedn.nssfRate.maxMonthly)

        // Calculate SHIF (2.75%)
        const shifAmount = grossSalary * dedn.shifRate

        // Calculate Housing Levy (1.5% employer only)
        const housingLevyAmount = grossSalary * dedn.housingLevyRate

        // Total deductions
        const totalDeductions = payeAmount + nssfEmployee + nssfEmployer + shifAmount + housingLevyAmount

        // Net salary
        const netSalary = grossSalary - payeAmount - nssfEmployee - shifAmount - housingLevyAmount

        // Create payslip
        const payslip = await prisma.payslip.create({
          data: {
            staffId,
            payrollRunId: `PR-${Date.now()}`,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            basicSalary,
            grossSalary,
            totalDeductions,
            netSalary,
            taxCode: `PAYE-KE-${Math.floor(Math.random() * 9000) + 1000}`,
            payPeriod: "MONTHLY",
            payDate: new Date(),
            status: "FINAL",
          },
        })

        // Create payslip lines
        await prisma.payslipLine.createMany({
          data: [
            { payslipId: payslip.id, description: "Basic Salary", amount: basicSalary, type: "ALLOWANCE" },
            { payslipId: payslip.id, description: "PAYE Tax", amount: payeAmount, type: "DEDUCTION" },
            { payslipId: payslip.id, description: "NSSF (Employee)", amount: nssfEmployee, type: "DEDUCTION" },
            { payslipId: payslip.id, description: "NSSF (Employer)", amount: nssfEmployer, type: "ALLOWANCE" },
            { payslipId: payslip.id, description: "SHIF", amount: shifAmount, type: "DEDUCTION" },
            { payslipId: payslip.id, description: "Housing Levy", amount: housingLevyAmount, type: "DEDUCTION" },
          ],
        })

        return NextResponse.json(payslip)
      }

      case "create-contract": {
        const {
          staffId,
          title,
          basicSalary,
          benefits,
          startDate,
          endDate,
          paymentSchedule,
        } = params

        const contract = await prisma.contract.create({
          data: {
            staffId,
            title,
            basicSalary,
            benefits: benefits || [],
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            paymentSchedule: paymentSchedule || "MONTHLY",
            isActive: true,
          },
        })

        return NextResponse.json(contract)
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("HR API POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper responses
function NextJSON(data: any) {
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}