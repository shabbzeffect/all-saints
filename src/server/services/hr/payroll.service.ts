/* payroll.service.ts
 * HR Payroll Service - SaintsHub
 * Kenya payroll: statutory config (PAYE/NSSF/SHIF/Housing Levy), payroll runs,
 * payslip generation, finalize/cancel, summaries. Amounts are KES (not cents).
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/server/db"
import {
  KENYA_STATUTORY_DEFAULTS,
  calculatePayroll,
  configFromDatabase,
  type KenyaStatutoryConfig,
} from "@/lib/payroll/kenya"
import { installmentDue, loanOutstanding } from "@/lib/payroll/loans"

// ============================================================================
// INSTITUTION RESOLUTION
// ============================================================================

export async function resolveInstitutionId(institutionId?: string | null): Promise<string> {
  if (institutionId) return institutionId
  const first = await prisma.institution.findFirst({ select: { id: true } })
  if (!first) throw new Error("No institution found")
  return first.id
}

// ============================================================================
// STATUTORY CONFIGURATION
// ============================================================================

/** Create per-year statutory config from Kenya defaults if missing (idempotent) */
export async function ensureStatutoryDeductions(institutionId: string, year: number) {
  const existing = await prisma.statutoryDeduction.findUnique({
    where: { institutionId_year: { institutionId, year } },
    include: { payeBands: true, nssfRate: true },
  })
  if (existing) return existing

  const d = KENYA_STATUTORY_DEFAULTS
  return prisma.statutoryDeduction.create({
    data: {
      institutionId,
      year,
      shifRate: d.shifRate,
      housingLevyRate: d.housingLevyRate,
      personalRelief: d.personalRelief,
      payeBands: {
        create: d.payeBands.map((b) => ({
          minSalary: b.minSalary,
          maxSalary: b.maxSalary,
          rate: b.rate,
        })),
      },
      nssfRate: {
        create: {
          employeePercent: d.nssfEmployeePercent,
          employerPercent: d.nssfEmployerPercent,
          maxMonthly: d.nssfMaxMonthly,
        },
      },
    },
    include: { payeBands: true, nssfRate: true },
  })
}

/** Load statutory config; falls back to Kenya defaults when not found */
export async function getStatutoryConfig(
  institutionId: string,
  year: number
): Promise<KenyaStatutoryConfig> {
  const record = await ensureStatutoryDeductions(institutionId, year)
  if (!record) return KENYA_STATUTORY_DEFAULTS
  return configFromDatabase({
    year: record.year,
    shifRate: record.shifRate,
    housingLevyRate: record.housingLevyRate,
    personalRelief: record.personalRelief,
    payeBands: record.payeBands,
    nssfRate: record.nssfRate,
  })
}

/** Full statutory settings for the settings screen (record + available years) */
export async function getStatutorySettings(institutionId: string, year: number) {
  const record = await ensureStatutoryDeductions(institutionId, year)
  const years = await prisma.statutoryDeduction.findMany({
    where: { institutionId },
    select: { year: true },
    orderBy: { year: "desc" },
  })
  return {
    record,
    years: years.map((y) => y.year),
    defaults: KENYA_STATUTORY_DEFAULTS,
  }
}

export interface UpdateStatutorySettingsInput {
  institutionId: string
  year: number
  personalRelief: number
  shifRate: number
  housingLevyRate: number
  nssfEmployeePercent: number
  nssfEmployerPercent: number
  nssfMaxMonthly: number
  payeBands: { minSalary: number; maxSalary: number | null; rate: number }[]
  actorId?: string
}

const clamp01 = (n: number) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1

/** Validate + upsert statutory settings for a year (replaces PAYE band set atomically) */
export async function updateStatutorySettings(input: UpdateStatutorySettingsInput) {
  const { institutionId, year } = input
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Invalid year")

  const bands = [...input.payeBands].sort((a, b) => a.minSalary - b.minSalary)
  if (bands.length === 0) throw new Error("At least one PAYE band is required")
  if (bands.length > 10) throw new Error("Too many PAYE bands")
  if (bands[0].minSalary !== 0) throw new Error("The first PAYE band must start at 0")
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i]
    if (!clamp01(b.rate) || b.rate > 0.5) throw new Error("PAYE rates must be between 0% and 50%")
    if (b.maxSalary !== null && b.maxSalary <= b.minSalary) {
      throw new Error("Each band's upper bound must exceed its lower bound")
    }
    if (i > 0) {
      const prevMax = bands[i - 1].maxSalary
      if (prevMax === null) throw new Error("Only the last PAYE band may be unlimited")
      if (Math.abs(b.minSalary - prevMax) > 0.01) throw new Error("PAYE bands must be contiguous")
    }
  }

  if (!(input.personalRelief >= 0 && input.personalRelief <= 100_000)) {
    throw new Error("Personal relief must be between 0 and 100,000")
  }
  if (!clamp01(input.shifRate) || input.shifRate > 0.2) throw new Error("SHIF rate must be between 0% and 20%")
  if (!clamp01(input.housingLevyRate) || input.housingLevyRate > 0.2) {
    throw new Error("Housing levy rate must be between 0% and 20%")
  }
  if (!clamp01(input.nssfEmployeePercent) || !clamp01(input.nssfEmployerPercent)) {
    throw new Error("NSSF percentages must be between 0% and 100%")
  }
  if (!(input.nssfMaxMonthly >= 0 && input.nssfMaxMonthly <= 1_000_000)) {
    throw new Error("NSSF maximum must be between 0 and 1,000,000")
  }

  const actorId = await resolveAuditActor(input.actorId)

  await prisma.$transaction(
    async (tx) => {
      const scalarData = {
        shifRate: input.shifRate,
        housingLevyRate: input.housingLevyRate,
        personalRelief: input.personalRelief,
      }
      const nssfData = {
        employeePercent: input.nssfEmployeePercent,
        employerPercent: input.nssfEmployerPercent,
        maxMonthly: input.nssfMaxMonthly,
      }

      const existing = await tx.statutoryDeduction.findUnique({
        where: { institutionId_year: { institutionId, year } },
      })

      if (existing) {
        await tx.payeBand.deleteMany({ where: { statutoryDeductionId: existing.id } })
        await tx.statutoryDeduction.update({
          where: { id: existing.id },
          data: {
            ...scalarData,
            payeBands: { create: bands },
            nssfRate: { upsert: { create: nssfData, update: nssfData } },
          },
        })
      } else {
        await tx.statutoryDeduction.create({
          data: {
            institutionId,
            year,
            ...scalarData,
            payeBands: { create: bands },
            nssfRate: { create: nssfData },
          },
        })
      }

      await tx.auditEvent.create({
        data: {
          actorId,
          action: "UPDATE",
          targetType: "StatutoryDeduction",
          targetName: String(year),
          institutionId,
          metadata: { action: "statutory_settings_updated", year },
        },
      })
    },
    { maxWait: 10_000, timeout: 30_000 }
  )

  return getStatutorySettings(institutionId, year)
}

/** Audit actor must reference a real user; "system" and other labels are dropped */
async function resolveAuditActor(actorId?: string | null): Promise<string | null> {
  if (!actorId) return null
  const user = await prisma.user.findUnique({ where: { id: actorId }, select: { id: true } })
  return user?.id ?? null
}

// ============================================================================
// PAYROLL RUN LIFECYCLE
// ============================================================================

export interface CreatePayrollRunInput {
  institutionId?: string | null
  month: number // 1-12
  year: number
  payDate?: Date
  createdById?: string
  notes?: string
}

export async function createPayrollRun(input: CreatePayrollRunInput) {
  const institutionId = await resolveInstitutionId(input.institutionId)
  const month = Math.trunc(input.month)
  const year = Math.trunc(input.year)
  if (month < 1 || month > 12) throw new Error("Month must be between 1 and 12")
  if (year < 2000 || year > 2100) throw new Error("Invalid year")

  const period = `${year}-${String(month).padStart(2, "0")}`
  const periodStart = new Date(Date.UTC(year, month - 1, 1))
  const periodEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59))
  const payDate = input.payDate ?? periodEnd

  const existing = await prisma.payrollRun.findUnique({
    where: { institutionId_period: { institutionId, period } },
  })
  if (existing) {
    throw Object.assign(new Error(`Payroll run for ${period} already exists`), { code: "DUPLICATE" })
  }

  const run = await prisma.payrollRun.create({
    data: {
      institutionId,
      period,
      periodStart,
      periodEnd,
      payDate,
      createdById: input.createdById ?? null,
      notes: input.notes ?? null,
    },
  })

  const actorId = await resolveAuditActor(input.createdById)
  await prisma.auditEvent.create({
    data: {
      actorId,
      action: "CREATE",
      targetType: "PayrollRun",
      targetName: period,
      institutionId,
      metadata: { action: "payroll_run_created", payrollRunId: run.id, period },
    },
  })

  return run
}

/** Compute (or recompute) a DRAFT payroll run: generates payslips for all ACTIVE staff with an active contract */
export async function computePayrollRun({
  runId,
  institutionId,
  adjustments,
}: {
  runId: string
  institutionId: string
  /** One-off per-staff allowances for this run */
  adjustments?: { staffId: string; allowances: number; notes?: string }[]
}) {
  const run = await prisma.payrollRun.findFirst({ where: { id: runId, institutionId } })
  if (!run) throw new Error("Payroll run not found")
  if (run.status !== "DRAFT") {
    throw new Error(`Cannot compute a ${run.status} run. Cancel it to recompute from scratch.`)
  }

  const config = await getStatutoryConfig(institutionId, run.periodStart.getUTCFullYear())
  const allowanceByStaff = new Map(
    (adjustments ?? []).map((a) => [a.staffId, Math.max(0, a.allowances)])
  )
  const notesByStaff = new Map((adjustments ?? []).map((a) => [a.staffId, a.notes]))

  const staff = await prisma.staff.findMany({
    where: { institutionId, status: "ACTIVE" },
    include: {
      user: { select: { name: true } },
      role: { select: { name: true } },
      contracts: { where: { isActive: true }, orderBy: { startDate: "desc" }, take: 1 },
    },
  })

  const payDate = run.payDate
  const computed = staff
    .map((s) => ({ staff: s, contract: s.contracts[0] }))
    .filter((x) => !!x.contract)

  // Unpaid (non-statutory-paid) leave approved during the period is prorated:
  // basic / 30 per calendar day, deducted pre-tax (reduces PAYE-chargeable gross)
  const unpaidLeave = computed.length
    ? await prisma.leaveRequest.findMany({
        where: {
          status: "APPROVED",
          staffId: { in: computed.map((c) => c.staff.id) },
          leaveType: { isPaid: false },
          startDate: { lte: run.periodEnd },
          endDate: { gte: run.periodStart },
        },
        select: {
          staffId: true,
          startDate: true,
          endDate: true,
          daysRequested: true,
          leaveType: { select: { name: true } },
        },
      })
    : []

  const unpaidByStaff = new Map<string, { days: number; types: string[] }>()
  for (const r of unpaidLeave) {
    const start = Math.max(r.startDate.getTime(), run.periodStart.getTime())
    const end = Math.min(r.endDate.getTime(), run.periodEnd.getTime())
    if (end < start) continue
    const overlapDays = Math.floor((end - start) / 86_400_000) + 1
    const days = Math.min(r.daysRequested, overlapDays)
    if (days <= 0) continue
    const current = unpaidByStaff.get(r.staffId) ?? { days: 0, types: [] as string[] }
    current.days += days
    if (!current.types.includes(r.leaveType.name)) current.types.push(r.leaveType.name)
    unpaidByStaff.set(r.staffId, current)
  }

  // Salary loans: outstanding balance = principal − repayments recorded against
  // FINAL payslips (DRAFT recomputes self-correct as their repayments cascade-delete)
  const activeLoans = computed.length
    ? await prisma.salaryLoan.findMany({
        where: {
          institutionId,
          status: "ACTIVE",
          startPeriod: { lte: run.period },
          staffId: { in: computed.map((c) => c.staff.id) },
        },
        orderBy: [{ startPeriod: "asc" }, { createdAt: "asc" }],
        include: {
          repayments: {
            where: { payslip: { status: "FINAL" } },
            select: { amount: true },
          },
        },
      })
    : []

  const loansByStaff = new Map<string, typeof activeLoans>()
  for (const loan of activeLoans) {
    const due = installmentDue({
      principal: loan.principal,
      monthlyInstallment: loan.monthlyInstallment,
      repayments: loan.repayments.map((r) => r.amount),
    })
    if (due <= 0) continue
    const list = loansByStaff.get(loan.staffId) ?? []
    list.push(loan)
    loansByStaff.set(loan.staffId, list)
  }

  // Sequential per-record writes; generous timeout for serverless Postgres latency
  await prisma.$transaction(
    async (tx) => {
    // Idempotency: drop previously computed DRAFT payslips for this run
    await tx.payslip.deleteMany({ where: { payrollRunId: run.id, status: "DRAFT" } })

    for (const { staff: s, contract } of computed) {
      const allowances = allowanceByStaff.get(s.id) ?? 0
      const unpaid = unpaidByStaff.get(s.id)
      const unpaidDays = Math.min(unpaid?.days ?? 0, 31)
      const preTax = unpaidDays > 0 ? Math.round((contract!.basicSalary / 30) * unpaidDays * 100) / 100 : 0
      const b = calculatePayroll(contract!.basicSalary, allowances, config, preTax)

      // Salary loans — post-tax deductions capped so net pay never goes negative
      const staffLoans = loansByStaff.get(s.id) ?? []
      let remainingNet = b.netSalary
      const loanDeductions = staffLoans.map((loan) => {
        const due = installmentDue({
          principal: loan.principal,
          monthlyInstallment: loan.monthlyInstallment,
          repayments: loan.repayments.map((r) => r.amount),
        })
        const taken = Math.round(Math.min(due, Math.max(0, remainingNet)) * 100) / 100
        remainingNet = Math.round((remainingNet - taken) * 100) / 100
        return { loan, amount: taken, capped: taken < due }
      })
      const loanTotal = loanDeductions.reduce((sum, d) => sum + d.amount, 0)
      const totalDeductions = Math.round((b.totalDeductions + loanTotal) * 100) / 100
      const netSalary = Math.round((b.netSalary - loanTotal) * 100) / 100

      const lines = [
        { description: "Basic Salary", amount: b.basicSalary, type: "ALLOWANCE", taxCategory: "BASIC" },
        ...(allowances > 0
          ? [{ description: "Allowances", amount: allowances, type: "ALLOWANCE", taxCategory: "ALLOWANCE" }]
          : []),
        ...(preTax > 0
          ? [
              {
                description: `Unpaid leave (${unpaidDays} day${unpaidDays === 1 ? "" : "s"})`,
                amount: -preTax,
                type: "ALLOWANCE",
                taxCategory: "UNPAID_LEAVE",
              },
            ]
          : []),
        { description: "PAYE", amount: b.paye, type: "DEDUCTION", taxCategory: "PAYE" },
        { description: "NSSF (Employee)", amount: b.nssfEmployee, type: "DEDUCTION", taxCategory: "NSSF" },
        { description: "SHIF", amount: b.shif, type: "DEDUCTION", taxCategory: "SHIF" },
        { description: "Housing Levy", amount: b.housingLevy, type: "DEDUCTION", taxCategory: "HOUSING_LEVY" },
        ...loanDeductions
          .filter((d) => d.amount > 0)
          .map((d) => ({
            description: `Loan — ${d.loan.description}`,
            amount: d.amount,
            type: "DEDUCTION",
            taxCategory: "LOAN",
          })),
        { description: "NSSF (Employer)", amount: b.nssfEmployer, type: "EMPLOYER", taxCategory: "NSSF" },
        { description: "Housing Levy (Employer)", amount: b.housingLevyEmployer, type: "EMPLOYER", taxCategory: "HOUSING_LEVY" },
      ]

      const adjustmentNotes = notesByStaff.get(s.id)
      const leaveNotes =
        preTax > 0 ? `Unpaid leave: ${unpaidDays} day(s) (${unpaid?.types.join(", ")})` : null
      const loanNotes =
        loanTotal > 0
          ? `Loans deducted: ${loanDeductions
              .filter((d) => d.amount > 0)
              .map((d) => `${d.loan.description} KES ${d.amount.toLocaleString("en-KE")}`)
              .join(", ")}${loanDeductions.some((d) => d.capped) ? " (capped to net pay)" : ""}`
          : null
      const notes = [adjustmentNotes, leaveNotes, loanNotes].filter(Boolean).join(" · ")

      await tx.payslip.create({
        data: {
          staffId: s.id,
          payrollRunId: run.id,
          periodStart: run.periodStart,
          periodEnd: run.periodEnd,
          basicSalary: b.basicSalary,
          grossSalary: b.grossSalary,
          totalDeductions,
          netSalary,
          employerCost: Math.round((b.nssfEmployer + b.housingLevyEmployer) * 100) / 100,
          payPeriod: "MONTHLY",
          payDate,
          status: "DRAFT",
          notes: notes || null,
          lines: { create: lines },
          loanRepayments: {
            create: loanDeductions
              .filter((d) => d.amount > 0)
              .map((d) => ({ loanId: d.loan.id, amount: d.amount, period: run.period })),
          },
        },
      })
    }

    const totals = await tx.payslip.aggregate({
      where: { payrollRunId: run.id },
      _sum: { grossSalary: true, totalDeductions: true, netSalary: true, employerCost: true },
      _count: { _all: true },
    })

    await tx.payrollRun.update({
      where: { id: run.id },
      data: {
        staffCount: totals._count._all,
        totalGross: totals._sum.grossSalary ?? 0,
        totalDeductions: totals._sum.totalDeductions ?? 0,
        totalNet: totals._sum.netSalary ?? 0,
        totalEmployerCost: totals._sum.employerCost ?? 0,
      },
    })

    await tx.auditEvent.create({
      data: {
        action: "UPDATE",
        targetType: "PayrollRun",
        targetName: run.period,
        institutionId,
        metadata: { action: "payroll_run_computed", payrollRunId: run.id, period: run.period, staffCount: totals._count._all },
      },
    })
    },
    { maxWait: 10_000, timeout: 30_000 }
  )

  return getPayrollRun({ runId, institutionId })
}

export async function finalizePayrollRun({
  runId,
  institutionId,
  finalizedById,
}: {
  runId: string
  institutionId: string
  finalizedById?: string
}) {
  const run = await prisma.payrollRun.findFirst({ where: { id: runId, institutionId } })
  if (!run) throw new Error("Payroll run not found")
  if (run.status !== "DRAFT") throw new Error(`Cannot finalize a ${run.status} run`)

  const count = await prisma.payslip.count({ where: { payrollRunId: run.id } })
  if (count === 0) throw new Error("Run has no payslips — compute it first")

  const finalizeActor = await resolveAuditActor(finalizedById)
  await prisma.$transaction(async (tx) => {
    await tx.payslip.updateMany({
      where: { payrollRunId: run.id, status: "DRAFT" },
      data: { status: "FINAL" },
    })
    await tx.payrollRun.update({
      where: { id: run.id },
      data: { status: "COMPLETED", finalizedAt: new Date() },
    })

    // Auto-settle loans fully repaid by this run (sum of FINAL repayments >= principal)
    const loanCandidates = await tx.salaryLoan.findMany({
      where: { institutionId, status: "ACTIVE" },
      include: {
        repayments: { where: { payslip: { status: "FINAL" } }, select: { amount: true } },
      },
    })
    let settled = 0
    for (const loan of loanCandidates) {
      const paid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
      if (paid >= loan.principal) {
        await tx.salaryLoan.update({ where: { id: loan.id }, data: { status: "SETTLED" } })
        settled += 1
      }
    }
    await tx.auditEvent.create({
      data: {
        actorId: finalizeActor,
        action: "FINANCIAL_ADJUSTMENT",
        targetType: "PayrollRun",
        targetName: run.period,
        institutionId,
        metadata: { action: "payroll_run_finalized", payrollRunId: run.id, period: run.period, staffCount: count, loansAutoSettled: settled },
      },
    })
  }, { maxWait: 10_000, timeout: 30_000 })

  return getPayrollRun({ runId, institutionId })
}

export async function cancelPayrollRun({
  runId,
  institutionId,
  actorId,
}: {
  runId: string
  institutionId: string
  actorId?: string
}) {
  const run = await prisma.payrollRun.findFirst({ where: { id: runId, institutionId } })
  if (!run) throw new Error("Payroll run not found")
  if (run.status === "CANCELLED") return run
  if (run.status === "COMPLETED") {
    throw new Error("A finalized run cannot be cancelled — reverse it with a correction run instead")
  }

  const cancelActor = await resolveAuditActor(actorId)
  await prisma.$transaction(async (tx) => {
    await tx.payslip.updateMany({
      where: { payrollRunId: run.id },
      data: { status: "CANCELLED" },
    })
    await tx.payrollRun.update({
      where: { id: run.id },
      data: { status: "CANCELLED" },
    })
    await tx.auditEvent.create({
      data: {
        actorId: cancelActor,
        action: "UPDATE",
        targetType: "PayrollRun",
        targetName: run.period,
        institutionId,
        metadata: { action: "payroll_run_cancelled", payrollRunId: run.id, period: run.period },
      },
    })
  }, { maxWait: 10_000, timeout: 30_000 })

  return prisma.payrollRun.findUnique({ where: { id: run.id } })
}

// ============================================================================
// QUERIES
// ============================================================================

const payslipInclude = {
  staff: {
    include: {
      user: { select: { name: true, email: true } },
      role: { select: { name: true } },
      employmentType: { select: { name: true, key: true } },
    },
  },
  lines: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.PayslipInclude

export async function listPayrollRuns({
  institutionId,
  limit = 24,
}: {
  institutionId: string
  limit?: number
}) {
  return prisma.payrollRun.findMany({
    where: { institutionId },
    orderBy: { period: "desc" },
    take: limit,
    include: { _count: { select: { payslips: true } } },
  })
}

export async function getPayrollRun({
  runId,
  institutionId,
}: {
  runId: string
  institutionId: string
}) {
  const run = await prisma.payrollRun.findFirst({
    where: { id: runId, institutionId },
    include: {
      payslips: {
        orderBy: { grossSalary: "desc" },
        include: payslipInclude,
      },
    },
  })
  if (!run) throw new Error("Payroll run not found")
  return run
}

export async function getPayslip({
  payslipId,
  institutionId,
}: {
  payslipId: string
  institutionId: string
}) {
  const payslip = await prisma.payslip.findFirst({
    where: { id: payslipId, run: { institutionId } },
    include: { ...payslipInclude, run: true },
  })
  if (!payslip) throw new Error("Payslip not found")
  return payslip
}

/** Summary for HR dashboards: active staff, estimated monthly payroll, latest runs */
export async function getPayrollSummary(institutionId: string) {
  const [activeStaff, contractSum, latestCompleted, draftRuns, activeLoans, finalLoanPayments] =
    await Promise.all([
      prisma.staff.count({ where: { institutionId, status: "ACTIVE" } }),
      prisma.contract.aggregate({
        _sum: { basicSalary: true },
        where: { isActive: true, staff: { institutionId, status: "ACTIVE" } },
      }),
      prisma.payrollRun.findFirst({
        where: { institutionId, status: "COMPLETED" },
        orderBy: { period: "desc" },
      }),
      prisma.payrollRun.count({ where: { institutionId, status: "DRAFT" } }),
      prisma.salaryLoan.aggregate({
        _sum: { principal: true },
        _count: { _all: true },
        where: { institutionId, status: "ACTIVE" },
      }),
      prisma.salaryLoanRepayment.aggregate({
        _sum: { amount: true },
        where: { loan: { institutionId, status: "ACTIVE" }, payslip: { status: "FINAL" } },
      }),
    ])

  return {
    activeStaff,
    estimatedMonthlyPayroll: contractSum._sum.basicSalary ?? 0,
    latestCompletedRun: latestCompleted
      ? {
          id: latestCompleted.id,
          period: latestCompleted.period,
          totalNet: latestCompleted.totalNet,
          totalGross: latestCompleted.totalGross,
          totalDeductions: latestCompleted.totalDeductions,
          staffCount: latestCompleted.staffCount,
          payDate: latestCompleted.payDate,
        }
      : null,
    draftRuns,
    activeLoans: activeLoans._count._all,
    outstandingLoans: Math.max(
      0,
      round2((activeLoans._sum.principal ?? 0) - (finalLoanPayments._sum.amount ?? 0))
    ),
  }
}

// ============================================================================
// ANNUAL TAX SUMMARY (P9-style)
// ============================================================================

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export async function getAnnualTaxReport(institutionId: string, year: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Invalid year")

  const payslips = await prisma.payslip.findMany({
    where: { status: "FINAL", run: { institutionId, period: { startsWith: `${year}-` } } },
    include: {
      staff: {
        include: {
          user: { select: { name: true, email: true } },
          role: { select: { name: true } },
          employmentType: { select: { name: true } },
        },
      },
      lines: true,
    },
    orderBy: { payDate: "asc" },
  })

  const byStaff = new Map<
    string,
    {
      staffId: string
      name: string
      email: string | null
      role: string
      employmentType: string
      monthsPaid: number
      basicSalary: number
      grossPay: number
      allowances: number
      paye: number
      nssfEmployee: number
      nssfEmployer: number
      shif: number
      housingLevy: number
      housingLevyEmployer: number
      totalDeductions: number
      netPay: number
    }
  >()

  for (const p of payslips) {
    const cur =
      byStaff.get(p.staffId) ??
      {
        staffId: p.staffId,
        name: p.staff.user.name ?? "Staff",
        email: p.staff.user.email ?? null,
        role: p.staff.role?.name ?? "",
        employmentType: p.staff.employmentType?.name ?? "",
        monthsPaid: 0,
        basicSalary: 0,
        grossPay: 0,
        allowances: 0,
        paye: 0,
        nssfEmployee: 0,
        nssfEmployer: 0,
        shif: 0,
        housingLevy: 0,
        housingLevyEmployer: 0,
        totalDeductions: 0,
        netPay: 0,
      }

    cur.monthsPaid += 1
    cur.basicSalary = round2(cur.basicSalary + p.basicSalary)
    cur.grossPay = round2(cur.grossPay + p.grossSalary)
    cur.totalDeductions = round2(cur.totalDeductions + p.totalDeductions)
    cur.netPay = round2(cur.netPay + p.netSalary)

    for (const line of p.lines) {
      const v = line.amount
      switch (line.taxCategory) {
        case "ALLOWANCE":
          cur.allowances = round2(cur.allowances + v)
          break
        case "PAYE":
          cur.paye = round2(cur.paye + v)
          break
        case "NSSF":
          if (line.type === "DEDUCTION") cur.nssfEmployee = round2(cur.nssfEmployee + v)
          else if (line.type === "EMPLOYER") cur.nssfEmployer = round2(cur.nssfEmployer + v)
          break
        case "SHIF":
          cur.shif = round2(cur.shif + v)
          break
        case "HOUSING_LEVY":
          if (line.type === "DEDUCTION") cur.housingLevy = round2(cur.housingLevy + v)
          else if (line.type === "EMPLOYER") cur.housingLevyEmployer = round2(cur.housingLevyEmployer + v)
          break
      }
    }
    byStaff.set(p.staffId, cur)
  }

  const rows = [...byStaff.values()].sort((a, b) => a.name.localeCompare(b.name))
  const totals = rows.reduce(
    (acc, r) => ({
      staff: acc.staff + 1,
      monthsPaid: acc.monthsPaid + r.monthsPaid,
      basicSalary: round2(acc.basicSalary + r.basicSalary),
      grossPay: round2(acc.grossPay + r.grossPay),
      allowances: round2(acc.allowances + r.allowances),
      paye: round2(acc.paye + r.paye),
      nssfEmployee: round2(acc.nssfEmployee + r.nssfEmployee),
      nssfEmployer: round2(acc.nssfEmployer + r.nssfEmployer),
      shif: round2(acc.shif + r.shif),
      housingLevy: round2(acc.housingLevy + r.housingLevy),
      housingLevyEmployer: round2(acc.housingLevyEmployer + r.housingLevyEmployer),
      totalDeductions: round2(acc.totalDeductions + r.totalDeductions),
      netPay: round2(acc.netPay + r.netPay),
    }),
    {
      staff: 0,
      monthsPaid: 0,
      basicSalary: 0,
      grossPay: 0,
      allowances: 0,
      paye: 0,
      nssfEmployee: 0,
      nssfEmployer: 0,
      shif: 0,
      housingLevy: 0,
      housingLevyEmployer: 0,
      totalDeductions: 0,
      netPay: 0,
    }
  )

  return { year, rows, totals, generatedAt: new Date().toISOString() }
}

// ============================================================================
// SALARY LOANS & ADVANCES
// ============================================================================

/** Minimal staff list for loan forms (id, name, designation, current basic) */
export async function listStaffForLoans(institutionId: string) {
  const staff = await prisma.staff.findMany({
    where: { institutionId, status: "ACTIVE" },
    include: {
      user: { select: { name: true, email: true } },
      role: { select: { name: true } },
      contracts: { where: { isActive: true }, orderBy: { startDate: "desc" }, take: 1 },
    },
    orderBy: { user: { name: "asc" } },
  })
  return staff.map((s) => ({
    id: s.id,
    name: s.user?.name ?? "Staff",
    email: s.user?.email ?? null,
    role: s.role?.name ?? null,
    basicSalary: s.contracts[0]?.basicSalary ?? 0,
  }))
}

const loanInclude = {
  staff: {
    include: {
      user: { select: { name: true, email: true } },
      role: { select: { name: true } },
    },
  },
} satisfies Prisma.SalaryLoanInclude

/** List loans with derived outstanding balance (FINAL repayments only) */
export async function listSalaryLoans({
  institutionId,
  staffId,
  status,
}: {
  institutionId: string
  staffId?: string | null
  status?: string | null
}) {
  const loans = await prisma.salaryLoan.findMany({
    where: {
      institutionId,
      ...(staffId ? { staffId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      ...loanInclude,
      repayments: {
        where: { payslip: { status: "FINAL" } },
        select: { amount: true },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  return loans.map(({ repayments, ...loan }) => ({
    ...loan,
    outstanding: loanOutstanding({
      principal: loan.principal,
      monthlyInstallment: loan.monthlyInstallment,
      repayments: repayments.map((r) => r.amount),
    }),
  }))
}

/** Loan detail with repayment history (all statuses, labelled by payslip status) */
export async function getSalaryLoan({
  id,
  institutionId,
}: {
  id: string
  institutionId: string
}) {
  const loan = await prisma.salaryLoan.findFirst({
    where: { id, institutionId },
    include: {
      ...loanInclude,
      repayments: {
        orderBy: { createdAt: "desc" },
        include: { payslip: { select: { id: true, status: true, periodStart: true } } },
      },
    },
  })
  if (!loan) throw new Error("Loan not found")

  const finalRepaid = loan.repayments
    .filter((r) => r.payslip.status === "FINAL")
    .reduce((sum, r) => sum + r.amount, 0)

  return {
    ...loan,
    outstanding: round2(Math.max(0, loan.principal - finalRepaid)),
  }
}

export interface CreateSalaryLoanInput {
  institutionId?: string | null
  staffId: string
  description: string
  principal: number
  monthlyInstallment: number
  startPeriod?: string // defaults to current period
  notes?: string
  actorId?: string
}

export async function createSalaryLoan(input: CreateSalaryLoanInput) {
  const institutionId = await resolveInstitutionId(input.institutionId)
  const staff = await prisma.staff.findFirst({ where: { id: input.staffId, institutionId } })
  if (!staff) throw new Error("Staff member not found in this institution")

  const principal = Math.round(input.principal * 100) / 100
  const monthlyInstallment = Math.round(input.monthlyInstallment * 100) / 100
  if (!(principal > 0)) throw new Error("Principal must be greater than 0")
  if (!(monthlyInstallment > 0)) throw new Error("Monthly installment must be greater than 0")
  if (monthlyInstallment > principal) throw new Error("Installment cannot exceed the principal")
  const description = input.description.trim()
  if (!description) throw new Error("Description is required")

  const now = new Date()
  const startPeriod =
    input.startPeriod ??
    String(now.getFullYear()) + "-" + String(now.getMonth() + 1).padStart(2, "0")

  const actorId = await resolveAuditActor(input.actorId)
  const loan = await prisma.salaryLoan.create({
    data: {
      institutionId,
      staffId: staff.id,
      description,
      principal,
      monthlyInstallment,
      startPeriod,
      notes: input.notes?.trim() || null,
    },
  })

  await prisma.auditEvent.create({
    data: {
      actorId,
      action: "CREATE",
      targetType: "SalaryLoan",
      targetName: description,
      institutionId,
      metadata: {
        action: "salary_loan_created",
        salaryLoanId: loan.id,
        staffId: staff.id,
        principal,
        monthlyInstallment,
        startPeriod,
      },
    },
  })

  return loan
}

/** Cancel (stop future deductions) or manually settle (only when fully repaid) */
export async function updateSalaryLoanStatus({
  id,
  institutionId,
  action,
  actorId,
}: {
  id: string
  institutionId: string
  action: "cancel" | "settle"
  actorId?: string
}) {
  const loan = await getSalaryLoan({ id, institutionId })
  if (loan.status === "CANCELLED" && action === "cancel") return loan
  if (loan.status === "SETTLED") {
    if (action === "settle") return loan
    throw new Error("A settled loan cannot be cancelled")
  }
  if (action === "settle" && loan.outstanding > 0) {
    throw new Error(`Loan still has an outstanding balance of KES ${loan.outstanding.toLocaleString("en-KE")}`)
  }

  const nextStatus = action === "cancel" ? "CANCELLED" : "SETTLED"
  const resolvedActor = await resolveAuditActor(actorId)
  const updated = await prisma.salaryLoan.update({ where: { id: loan.id }, data: { status: nextStatus } })

  await prisma.auditEvent.create({
    data: {
      actorId: resolvedActor,
      action: "UPDATE",
      targetType: "SalaryLoan",
      targetName: loan.description,
      institutionId,
      metadata: { action: `salary_loan_${nextStatus.toLowerCase()}`, salaryLoanId: loan.id },
    },
  })

  return { ...updated, outstanding: loan.outstanding }
}
