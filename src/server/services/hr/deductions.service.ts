/* deductions.service.ts
 * Statutory deduction calculations for Kenya payroll (2025 rates).
 * Thin wrapper over the tested pure engine in @/lib/payroll/kenya.
 * Prefer importing from @/lib/payroll/kenya directly in new code.
 */

import {
  calculatePayroll,
  calculatePaye,
  configFromDatabase,
  KENYA_STATUTORY_DEFAULTS,
  type PayeBandConfig,
  type KenyaStatutoryConfig,
} from "@/lib/payroll/kenya"
import { prisma } from "@/server/db"

export interface DeductionResult {
  grossSalary: number
  chargeablePay: number
  payeAmount: number
  nssfEmployee: number
  nssfEmployer: number
  shifAmount: number
  housingLevyEmployee: number
  housingLevyEmployer: number
  totalDeductions: number
  netSalary: number
  totalEmployerCost: number
}

const asConfig = (statDef?: Partial<KenyaStatutoryConfig>): KenyaStatutoryConfig => ({
  ...KENYA_STATUTORY_DEFAULTS,
  ...statDef,
})

/** Calculate all statutory deductions for a monthly gross salary (KES) */
export const calculateStatutoryDeductions = async (
  grossSalary: number,
  statDef?: Partial<KenyaStatutoryConfig>
): Promise<DeductionResult> => {
  const b = calculatePayroll(grossSalary, 0, asConfig(statDef))
  return {
    grossSalary: b.grossSalary,
    chargeablePay: b.chargeablePay,
    payeAmount: b.paye,
    nssfEmployee: b.nssfEmployee,
    nssfEmployer: b.nssfEmployer,
    shifAmount: b.shif,
    housingLevyEmployee: b.housingLevy,
    housingLevyEmployer: b.housingLevyEmployer,
    totalDeductions: b.totalDeductions,
    netSalary: b.netSalary,
    totalEmployerCost: b.totalEmployerCost,
  }
}

/** PAYE for a monthly chargeable pay (exposed for reporting) */
export const calculatePAYE = (
  chargeablePay: number,
  bands: PayeBandConfig[] = KENYA_STATUTORY_DEFAULTS.payeBands,
  personalRelief: number = KENYA_STATUTORY_DEFAULTS.personalRelief
): number => calculatePaye(chargeablePay, bands, personalRelief)

/** Get statutory deduction configuration for an institution (latest year) */
export const getStatutoryDeductionConfig = async (institutionId: string) => {
  const config = await prisma.statutoryDeduction.findFirst({
    where: { institutionId },
    orderBy: { year: "desc" },
    include: { payeBands: true, nssfRate: true },
  })
  if (!config) return KENYA_STATUTORY_DEFAULTS
  return configFromDatabase({
    year: config.year,
    shifRate: config.shifRate,
    housingLevyRate: config.housingLevyRate,
    payeBands: config.payeBands,
    nssfRate: config.nssfRate,
  })
}

export { calculatePayroll, KENYA_STATUTORY_DEFAULTS }
