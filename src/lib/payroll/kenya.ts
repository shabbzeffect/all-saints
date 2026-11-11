/* kenya.ts
 * Kenya payroll statutory engine (Finance Act 2024 / NSSF Act 2013 Phase 3, Feb 2025)
 * Pure functions — unit tested in tests/unit/kenya.test.ts
 *
 * Defaults are used to seed per-institution statutory config (statutory_deductions
 * table) and as a fallback when no config exists for a year. All rates can be
 * overridden per year in the database without code changes.
 */

export interface PayeBandConfig {
  minSalary: number
  maxSalary: number | null // null = unlimited upper bound
  rate: number
}

export interface KenyaStatutoryConfig {
  year: number
  payeBands: PayeBandConfig[]
  personalRelief: number // monthly, KES
  nssfEmployeePercent: number
  nssfEmployerPercent: number
  nssfMaxMonthly: number // employee cap per month, KES
  shifRate: number // % of gross, e.g. 0.0275
  shifMin: number // minimum monthly SHIF, KES
  housingLevyRate: number // each side (employee + employer), e.g. 0.015
}

/** Kenya statutory defaults effective 1 Feb 2025 (NSSF Phase 3) / FY 2025-26 (PAYE) */
export const KENYA_STATUTORY_DEFAULTS: KenyaStatutoryConfig = {
  year: 2026,
  payeBands: [
    { minSalary: 0, maxSalary: 24000, rate: 0.10 },
    { minSalary: 24000, maxSalary: 32333, rate: 0.25 },
    { minSalary: 32333, maxSalary: 500000, rate: 0.30 },
    { minSalary: 500000, maxSalary: 800000, rate: 0.325 },
    { minSalary: 800000, maxSalary: null, rate: 0.35 },
  ],
  personalRelief: 2400,
  nssfEmployeePercent: 0.06,
  nssfEmployerPercent: 0.06,
  nssfMaxMonthly: 4320, // 6% of UEL 72,000
  shifRate: 0.0275,
  shifMin: 300,
  housingLevyRate: 0.015,
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Progressive PAYE on monthly chargeable pay, less personal relief */
export function calculatePaye(
  chargeablePay: number,
  bands: PayeBandConfig[],
  personalRelief: number
): number {
  let tax = 0
  for (const band of [...bands].sort((a, b) => a.minSalary - b.minSalary)) {
    const upper = band.maxSalary ?? Number.POSITIVE_INFINITY
    if (chargeablePay <= band.minSalary) continue
    const taxable = Math.min(chargeablePay, upper) - band.minSalary
    tax += taxable * band.rate
  }
  return round2(Math.max(0, tax - personalRelief))
}

export interface PayrollBreakdown {
  basicSalary: number
  grossSalary: number
  /** Pre-tax deduction applied against gross (e.g. unpaid leave proration) */
  preTaxDeduction: number
  /** Gross less NSSF employee — the amount PAYE is computed on */
  chargeablePay: number
  paye: number
  nssfEmployee: number
  nssfEmployer: number
  shif: number
  housingLevy: number // employee portion
  housingLevyEmployer: number
  totalDeductions: number // employee-borne: PAYE + NSSF + SHIF + housing levy
  netSalary: number
  totalEmployerCost: number // gross + employer NSSF + employer housing levy
}

/** Full statutory breakdown for one month.
 * gross = basic + allowances − preTaxDeduction (e.g. unpaid leave proration) */
export function calculatePayroll(
  basicSalary: number,
  allowances: number,
  config: KenyaStatutoryConfig,
  preTaxDeduction: number = 0
): PayrollBreakdown {
  const basic = Math.max(0, basicSalary)
  const allow = Math.max(0, allowances)
  const preTax = Math.min(Math.max(0, preTaxDeduction), basic + allow)
  const gross = round2(basic + allow - preTax)

  const nssfEmployee = round2(Math.min(gross * config.nssfEmployeePercent, config.nssfMaxMonthly))
  const nssfEmployer = round2(Math.min(gross * config.nssfEmployerPercent, config.nssfMaxMonthly))

  const chargeablePay = round2(Math.max(0, gross - nssfEmployee))
  const paye = calculatePaye(chargeablePay, config.payeBands, config.personalRelief)

  const shif = round2(Math.max(gross * config.shifRate, gross > 0 ? config.shifMin : 0))
  const housingLevy = round2(gross * config.housingLevyRate)
  const housingLevyEmployer = round2(gross * config.housingLevyRate)

  const totalDeductions = round2(paye + nssfEmployee + shif + housingLevy)
  const netSalary = round2(gross - totalDeductions)
  const totalEmployerCost = round2(gross + nssfEmployer + housingLevyEmployer)

  return {
    basicSalary: round2(basic),
    grossSalary: gross,
    preTaxDeduction: preTax,
    chargeablePay,
    paye,
    nssfEmployee,
    nssfEmployer,
    shif,
    housingLevy,
    housingLevyEmployer,
    totalDeductions,
    netSalary,
    totalEmployerCost,
  }
}

/** Convert a DB StatutoryDeduction (with payeBands + nssfRate) into a config object */
export function configFromDatabase(record: {
  year: number
  shifRate: number
  housingLevyRate: number
  personalRelief?: number | null
  payeBands: { minSalary: number; maxSalary: number | null; rate: number }[]
  nssfRate: { employeePercent: number; employerPercent: number; maxMonthly: number } | null
}): KenyaStatutoryConfig {
  return {
    year: record.year,
    payeBands: record.payeBands.map((b) => ({
      minSalary: b.minSalary,
      maxSalary: b.maxSalary,
      rate: b.rate,
    })),
    personalRelief: record.personalRelief ?? KENYA_STATUTORY_DEFAULTS.personalRelief,
    nssfEmployeePercent: record.nssfRate?.employeePercent ?? KENYA_STATUTORY_DEFAULTS.nssfEmployeePercent,
    nssfEmployerPercent: record.nssfRate?.employerPercent ?? KENYA_STATUTORY_DEFAULTS.nssfEmployerPercent,
    nssfMaxMonthly: record.nssfRate?.maxMonthly ?? KENYA_STATUTORY_DEFAULTS.nssfMaxMonthly,
    shifRate: record.shifRate,
    shifMin: KENYA_STATUTORY_DEFAULTS.shifMin,
    housingLevyRate: record.housingLevyRate,
  }
}
