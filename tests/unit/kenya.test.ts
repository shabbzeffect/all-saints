import { describe, it, expect } from "vitest"
import {
  calculatePayroll,
  calculatePaye,
  KENYA_STATUTORY_DEFAULTS,
  configFromDatabase,
} from "@/lib/payroll/kenya"

const config = KENYA_STATUTORY_DEFAULTS

describe("calculatePaye", () => {
  it("applies 10% band with personal relief below 24k", () => {
    // 20,000 * 10% = 2,000 - 2,400 relief = 0 (relief floors at 0)
    expect(calculatePaye(20000, config.payeBands, config.personalRelief)).toBe(0)
  })

  it("computes progressive tax across bands", () => {
    // gross 100,000 → bands: 24,000*10% + 8,333*25% + 67,667*30% = 2400+2083.25+20300.1 = 24,783.35; less 2,400 relief
    expect(calculatePaye(100000, config.payeBands, config.personalRelief)).toBeCloseTo(22383.35, 2)
  })

  it("applies 35% top band above 800k", () => {
    // 1,000,000: 2400 + 2083.25 + (500,000-32,333=467,667*30%=140,300.1) + 300,000*32.5%=97,500 + 200,000*35%=70,000 = 312,283.35 − 2,400
    expect(calculatePaye(1000000, config.payeBands, config.personalRelief)).toBeCloseTo(309883.35, 2)
  })

  it("never goes below zero", () => {
    expect(calculatePaye(0, config.payeBands, config.personalRelief)).toBe(0)
  })
})

describe("calculatePayroll", () => {
  it("computes a typical teacher payslip (62,000 basic)", () => {
    const r = calculatePayroll(62000, 0, config)
    // NSSF: 6% = 3,720 (under cap)
    expect(r.nssfEmployee).toBeCloseTo(3720, 2)
    expect(r.nssfEmployer).toBeCloseTo(3720, 2)
    // chargeable 58,280 → bands: 2400 + 8,333*25% = 2083.25 + (58,280-32,333)*30% = 7,784.1 → 12,267.35 − 2,400 = 9,867.35
    expect(r.paye).toBeCloseTo(9867.35, 2)
    // SHIF: 2.75% of 62,000 = 1,705 (above 300 min)
    expect(r.shif).toBeCloseTo(1705, 2)
    // Housing levy 1.5% = 930 employee + 930 employer
    expect(r.housingLevy).toBeCloseTo(930, 2)
    expect(r.housingLevyEmployer).toBeCloseTo(930, 2)
    expect(r.totalDeductions).toBeCloseTo(9867.35 + 3720 + 1705 + 930, 2)
    expect(r.netSalary).toBeCloseTo(62000 - (9867.35 + 3720 + 1705 + 930), 2)
    expect(r.totalEmployerCost).toBeCloseTo(62000 + 3720 + 930, 2)
  })

  it("caps NSSF at the monthly maximum", () => {
    const r = calculatePayroll(145000, 0, config)
    expect(r.nssfEmployee).toBe(4320)
    expect(r.nssfEmployer).toBe(4320)
  })

  it("enforces the SHIF minimum of 300", () => {
    const r = calculatePayroll(5000, 0, config)
    expect(r.shif).toBe(300)
  })

  it("adds allowances to gross", () => {
    const r = calculatePayroll(50000, 10000, config)
    expect(r.grossSalary).toBe(60000)
    expect(r.basicSalary).toBe(50000)
  })

  it("handles zero pay", () => {
    const r = calculatePayroll(0, 0, config)
    expect(r.grossSalary).toBe(0)
    expect(r.totalDeductions).toBe(0)
    expect(r.netSalary).toBe(0)
    expect(r.shif).toBe(0)
    expect(r.paye).toBe(0)
  })

  it("applies unpaid leave as a pre-tax deduction (proration)", () => {
    const full = calculatePayroll(62000, 0, config)
    const twoDaysUnpaid = calculatePayroll(62000, 0, config, 4133.33) // basic/30 * 2
    expect(twoDaysUnpaid.grossSalary).toBeCloseTo(57866.67, 2)
    expect(twoDaysUnpaid.preTaxDeduction).toBe(4133.33)
    expect(twoDaysUnpaid.paye).toBeLessThan(full.paye)
    expect(twoDaysUnpaid.nssfEmployee).toBeCloseTo(57866.67 * 0.06, 1)
    expect(twoDaysUnpaid.netSalary).toBeLessThan(full.netSalary)
  })

  it("caps pre-tax deduction at gross", () => {
    const r = calculatePayroll(10000, 0, config, 999999)
    expect(r.grossSalary).toBe(0)
    expect(r.netSalary).toBe(0)
  })
})

describe("configFromDatabase", () => {
  it("maps DB rows into a config object", () => {
    const cfg = configFromDatabase({
      year: 2026,
      shifRate: 0.0275,
      housingLevyRate: 0.015,
      payeBands: [
        { minSalary: 0, maxSalary: 24000, rate: 0.1 },
        { minSalary: 24000, maxSalary: null, rate: 0.3 },
      ],
      nssfRate: { employeePercent: 0.06, employerPercent: 0.06, maxMonthly: 4320 },
    })
    expect(cfg.year).toBe(2026)
    expect(cfg.payeBands).toHaveLength(2)
    expect(cfg.nssfMaxMonthly).toBe(4320)
    expect(cfg.shifMin).toBe(300)
    expect(cfg.personalRelief).toBe(2400)
  })

  it("falls back to defaults when nssfRate is null", () => {
    const cfg = configFromDatabase({
      year: 2026,
      shifRate: 0.0275,
      housingLevyRate: 0.015,
      payeBands: [],
      nssfRate: null,
    })
    expect(cfg.nssfEmployeePercent).toBe(0.06)
    expect(cfg.nssfMaxMonthly).toBe(4320)
  })

  it("uses record personalRelief when provided", () => {
    const cfg = configFromDatabase({
      year: 2026,
      shifRate: 0.0275,
      housingLevyRate: 0.015,
      personalRelief: 3000,
      payeBands: [],
      nssfRate: null,
    })
    expect(cfg.personalRelief).toBe(3000)
  })
})
