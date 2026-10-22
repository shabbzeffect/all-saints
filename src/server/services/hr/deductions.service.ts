/* eslint-disable react/prop-types */
/* HR & Payroll Calculation Service - SaintsHub
Provides: statutory deduction calculations per Kenyan law (2024)
- PAYE (Progressive tax bands)
- NSSF (6% employee + 6% employer, max KES 18,000 each)
- SHIF (2.75% of gross salary)
- Housing Levy (1.5% employer only)
*/

import { prisma } from "@/src/server/db"

/**
 * Calculate all statutory deductions for a given gross salary
 * and statutory deduction configuration.
 */
export interface DeductionResult {
  /** Gross salary amount (KES) */
  grossSalary: number

  /** PAYE tax amount (KES) - progressive bands */
  payeAmount: number

  /** NSSF employee contribution (KES) - 6% of gross, max 18,000 */
  nssfEmployee: number

  /** NSSF employer contribution (KES) - 6% of gross, max 18,000 */
  nssfEmployer: number

  /** SHIF amount (KES) - 2.75% of gross */
  shifAmount: number

  /** Housing Levy (KES) - 1.5% of gross, employer only */
  housingLevyAmount: number

  /** Total deductions (KES) */
  totalDeductions: number

  /** Net salary after all deductions (KES) */
  netSalary: number

  /** PAYE tax code generated */
  taxCode: string
}

/**
 * Get the 2024 PAYE tax bands for Kenya Revenue Authority
 */
const getPayeBands = (): { minSalary: number; maxSalary: number; rate: number }[] => {
  return [
    { minSalary: 0, maxSalary: 24888, rate: 0.10 }, // 10%
    { minSalary: 24889, maxSalary: 41480, rate: 0.15 }, // 15%
    { minSalary: 41481, maxSalary: 65575, rate: 0.20 }, // 20%
    { minSalary: 65576, maxSalary: 102700, rate: 0.25 }, // 25%
    { minSalary: 102701, maxSalary: Infinity, rate: 0.30 }, // 30%
  ]
}

/**
 * Calculate PAYE using progressive tax bands
 */
const calculatePAYE = (grossSalary: number, bands: typeof getPayeBands): number => {
  let paye = 0
  let remaining = grossSalary

  for (const band of bands) {
    if (remaining <= 0) break

    const taxableInBand = Math.min(remaining, band.maxSalary - band.minSalary + 1)
    const amountInBand = Math.max(0, taxableInBand)
    paye += amountInBand * band.rate
    remaining -= amountInBand
  }

  return Math.round(paye)
}

/**
 * Calculate all statutory deductions
 *
 * @param grossSalary - Gross salary before deductions (KES)
 * @param statDef - StatutoryDeduction config from database
 * @returns Complete deduction breakdown
 */
export const calculateStatutoryDeductions = async (
  grossSalary: number,
  statDef?: {
    payeBands?: typeof getPayeBands
    nssfRate?: { employeePercent: number; employerPercent: number; maxMonthly: number }
    shifRate?: number
    housingLevyRate?: number
  }
): Promise<DeductionResult> => {
  // Use provided config or fetch from database
  const bands = statDef?.payeBands || getPayeBands()

  // PAYE calculation
  const payeAmount = calculatePAYE(grossSalary, bands)

  // NSSF: 6% employee + 6% employer, max KES 18,000 each per month
  const nssfEmployee = Math.min(grossSalary * 0.06, 18000)
  const nssfEmployer = Math.min(grossSalary * 0.06, 18000)

  // SHIF: 2.75% of gross salary
  const shifRate = statDef?.shifRate ?? 0.0275
  const shifAmount = Math.round(grossSalary * shifRate)

  // Housing Levy: 1.5% of gross salary, employer only
  const housingLevyRate = statDef?.housingLevyRate ?? 0.015
  const housingLevyAmount = Math.round(grossSalary * housingLevyRate)

  // Total deductions
  const totalDeductions = payeAmount + nssfEmployee + nssfEmployer + shifAmount + housingLevyAmount

  // Net salary
  const netSalary = Math.round(grossSalary - totalDeductions)

  // Generate tax code
  const taxCode = `PAYE-KE-${Math.floor(Math.random() * 9000) + 1000}`

  return {
    grossSalary,
    payeAmount,
    nssfEmployee,
    nssfEmployer,
    shifAmount,
    housingLevyAmount,
    totalDeductions,
    netSalary,
    taxCode,
  }
}

/**
 * Generate a payslip with all line items
 *
 * @param staffId - Staff user ID
 * @param basicSalary - Basic salary component (KES)
 * @param allowances - Allowances/overtime (KES), defaults to 0
 * @param periodStart - Pay period start date
 * @param periodEnd - Pay period end date
 * @param statDef - Optional statutory deduction config; fetches from DB if not provided
 * @returns Payslip object with lines
 */
export const generatePayslip = async (
  staffId: string,
  basicSalary: number,
  allowances: number = 0,
  periodStart: Date,
  periodEnd: Date,
  statDef?: {
    payeBands?: typeof getPayeBands
    nssfRate?: { employeePercent: number; employerPercent: number; maxMonthly: number }
    shifRate?: number
    housingLevyRate?: number
  }
) => {
  const grossSalary = basicSalary + allowances

  const deductions = await calculateStatutoryDeductions(grossSalary, statDef)
  const netSalary = deductions.netSalary

  // Create payslip lines
  const lines = [
    {
      description: "Basic Salary",
      amount: basicSalary,
      type: "ALLOWANCE" as const,
    },
    {
      description: "Allowances / Overtime",
      amount: allowances,
      type: "ALLOWANCE" as const,
    },
    {
      description: "PAYE Tax",
      amount: deductions.payeAmount,
      type: "DEDUCTION" as const,
    },
    {
      description: "NSSF (Employee)",
      amount: deductions.nssfEmployee,
      type: "DEDUCTION" as const,
    },
    {
      description: "NSSF (Employer)",
      amount: deductions.nssfEmployer,
      type: "ALLOWANCE" as const, // Employer cost, not deducted from staff
    },
    {
      description: "SHIF",
      amount: deductions.shifAmount,
      type: "DEDUCTION" as const,
    },
    {
      description: "Housing Levy",
      amount: deductions.housingLevyAmount,
      type: "DEDUCTION" as const,
    },
  ]

  // Total deductions (employeeborne only)
  const totalEmployeeDeductions = deductions.payeAmount + deductions.nssfEmployee + deductions.shifAmount + deductions.housingLevyAmount

  return {
    grossSalary,
    basicSalary,
    allowances,
    totalDeductions: totalEmployeeDeductions,
    netSalary,
    taxCode: deductions.taxCode,
    lines,
  }
}

/**
 * Get statutory deduction configuration for an institution
 */
export const getStatutoryDeductionConfig = async (institutionId: string) => {
  const config = await prisma.statutoryDeduction.findFirst({
    where: { institutionId },
    orderBy: { year: "desc" },
  })

  if (config) {
    return {
      payeBands: config.payeBands as typeof getPayeBands,
      nssfRate: {
        employeePercent: config.nssfRate.employeePercent,
        employerPercent: config.nssfRate.employerPercent,
        maxMonthly: config.nssfRate.maxMonthly,
      },
      shifRate: config.shifRate,
      housingLevyRate: config.housingLevyRate,
    }
  }

  // Return default 2024 config if none found
  return {
    payeBands: getPayeBands(),
    nssfRate: {
      employeePercent: 0.06,
      employerPercent: 0.06,
      maxMonthly: 18000,
    },
    shifRate: 0.0275,
    housingLevyRate: 0.015,
  }
}

/**
 * Calculate net salary given basic salary and deductions
 */
export const calculateNetSalary = (
  basicSalary: number,
  paye: number,
  nssfEmployee: number,
  nssfEmployer: number,
  shifAmount: number,
  housingLevyAmount: number
): number => {
  const totalDeductions = paye + nssfEmployee + shifAmount + housingLevyAmount
  return Math.max(0, basicSalary - totalDeductions)
}

/**
 * Format salary as KES currency string
 */
export const formatKES = (amount: number): string => {
  return `KSh ${amount.toLocaleString("en-KE")}`
}

/**
 * Format net salary summary
 */
export const formatSalarySummary = (
  gross: number,
  net: number,
  deductions: number
): string => {
  const lines = [
    `Gross Salary: ${formatKES(gross)}`,
    `Total Deductions: ${formatKES(deductions)}`,
    `Net Salary: ${formatKES(net)}`,
    `Deduction Rate: ${((deductions / gross) * 100).toFixed(1)}%`,
  ]
  return lines.join("\n")
}

export type {
  DeductionResult,
  PayeBand,
  EmployeeRate,
}

export { calculatePAYE, formatKES, formatSalarySummary }