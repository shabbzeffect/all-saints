/* payroll.service.ts
 * HR Payroll Service - SaintsHub
 * Provides: Salary processing, payslip generation, tax calculation, bonus management
 */

interface Employee {
  id: string
  admissionNumber: string
  fullName: string
  email: string
  phone: string
  designation: string
  department: string
  joiningDate: string
  basicSalary: number
  hra: number
  allowances: number
  deductions: number
  netSalary: number
  taxSlab: string
  status: "active" | "inactive" | "terminated"
  bankDetails: {
    accountNumber: string
    ifscCode: string
    bankName: string
  }
}

interface Payslip {
  id: string
  employeeId: string
  employeeName: string
  month: string
  year: number
  basicSalary: number
  hra: number
  allowances: number
  totalEarnings: number
  deductions: {
    tds: number
    pf: number
    professionalTax: number
    other: number
  }
  netPay: number
  generatedAt: string
}

interface TaxCalculation {
  annualGross: number
  taxableIncome: number
  tds: number
  effectiveTaxRate: number
}

export class PayrollService {
  static async calculateSalary(employee: Employee): Promise<Employee> {
    const totalEarnings = employee.basicSalary + employee.hra + employee.allowances
    const grossSalary = totalEarnings
    const tds = this.calculateTDS(grossSalary)
    const pf = Math.floor(grossSalary * 0.12) // 12% PF
    const professionalTax = this.calculateProfessionalTax(employee)
    const totalDeductions = tds + pf + professionalTax
    const netSalary = grossSalary - totalDeductions

    return {
      ...employee,
      deductions: tds + pf + professionalTax,
      netSalary,
    }
  }

  static async generatePayslip(
    employeeId: string,
    month: string,
    year: number
  ): Promise<Payslip | null> {
    // In production, fetch employee from db and generate payslip
    return null
  }

  static async calculateTax(
    annualGross: number
  ): Promise<TaxCalculation> {
    const taxSlabs = [
      { limit: 250000, rate: 0 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.2 },
      { limit: undefined, rate: 0.3 },
    ]

    let taxableIncome = annualGross
    let tds = 0

    for (const slab of taxSlabs) {
      if (slab.limit && annualGross > slab.limit) {
        const taxable portion = annualGross - slab.limit
        tds += taxablePortion * slab.rate
        taxableIncome = slab.limit
      }
    }

    const effectiveTaxRate = annualGross > 0 ? tds / annualGross : 0

    return { annualGross, taxableIncome, tds, effectiveTaxRate }
  }

  static async processPayroll(month: string, year: number): Promise<{
    totalEmployees: number
    totalBasic: number
    totalTDS: number
    totalNet: number
    processed: Employee[]
  }> {
    // In production, would fetch all active employees and process
    return {
      totalEmployees: 0,
      totalBasic: 0,
      totalTDS: 0,
      totalNet: 0,
      processed: [],
    }
  }

  private static calculateTDS(annualGross: number): number {
    const taxSlabs = [
      { limit: 250000, rate: 0 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.2 },
      { limit: undefined, rate: 0.3 },
    ]

    let tds = 0
    let remaining = annualGross

    for (const slab of taxSlabs) {
      if (slab.limit && remaining > slab.limit) {
        const taxableAmount = remaining - slab.limit
        tds += taxableAmount * slab.rate
        remaining = slab.limit
      } else if (!slab.limit) {
        tds += remaining * slab.rate
      }
    }

    return tds
  }

  private static calculateProfessionalTax(employee: Employee): number {
    // Kenya professional tax slab (simplified)
    const annualGross =
      employee.basicSalary * 12 + employee.hra * 12 + employee.allowances * 12

    if (annualGross <= 240000) return 0
    if (annualGross <= 300000) return 600 // per annum, monthly: 50
    if (annualGross <= 350000) return 1200 // per annum, monthly: 100
    return 1800 // per annum, monthly: 150
  }
}