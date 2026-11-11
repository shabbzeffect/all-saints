/* HR Directory Service - SaintsHub
 * Live staff directory, leave activity and HR summary for the portal.
 * Salary figures are deliberately excluded — this is a staff directory,
 * not payroll data (payslips and contracts live behind hr:payroll:read).
 */

import { prisma } from "@/server/db"

export async function getHrDirectory(institutionId: string) {
  const [staff, leaveRequests, contractSum] = await Promise.all([
    prisma.staff.findMany({
      where: { institutionId },
      include: {
        user: { select: { name: true, email: true } },
        role: { select: { name: true } },
        employmentType: { select: { key: true, name: true } },
        contracts: { where: { isActive: true }, orderBy: { startDate: "desc" }, take: 1, select: { basicSalary: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.leaveRequest.findMany({
      where: { staff: { institutionId } },
      include: {
        staff: { include: { user: { select: { name: true } } } },
        leaveType: { select: { name: true, isPaid: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.contract.aggregate({
      _sum: { basicSalary: true },
      where: { isActive: true, staff: { institutionId, status: "ACTIVE" } },
    }),
  ])

  const activeStaff = staff.filter((s) => s.status === "ACTIVE").length
  const onLeave = staff.filter((s) => s.status === "ON_LEAVE").length
  const inactive = staff.filter((s) => s.status === "INACTIVE").length
  const terminated = staff.filter((s) => s.status === "TERMINATED").length

  return {
    staff: staff.map((s) => ({
      id: s.id,
      name: s.user?.name ?? "Staff",
      email: s.user?.email ?? "",
      phone: s.phone,
      role: s.role?.name ?? "—",
      employmentType: s.employmentType?.key ?? "UNKNOWN",
      employmentTypeName: s.employmentType?.name ?? "Unknown",
      dateOfJoining: s.dateOfJoining.toISOString(),
      status: s.status,
      hasActiveContract: (s.contracts?.length ?? 0) > 0,
    })),
    leaveRequests: leaveRequests.map((r) => ({
      id: r.id,
      staffName: r.staff.user?.name ?? "Staff",
      leaveType: r.leaveType.name,
      isPaid: r.leaveType.isPaid,
      daysRequested: r.daysRequested,
      status: r.status,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    })),
    summary: {
      totalStaff: staff.length,
      activeStaff,
      onLeave,
      inactive,
      terminated,
      estimatedMonthlyPayroll: contractSum._sum.basicSalary ?? 0,
    },
  }
}
