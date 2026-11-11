import { describe, it, expect } from "vitest"
import { installmentDue, loanOutstanding } from "@/lib/payroll/loans"

describe("loanOutstanding", () => {
  it("returns principal when nothing repaid", () => {
    expect(loanOutstanding({ principal: 60_000, monthlyInstallment: 5_000, repayments: [] })).toBe(60_000)
  })

  it("subtracts repayments", () => {
    expect(
      loanOutstanding({ principal: 60_000, monthlyInstallment: 5_000, repayments: [5000, 5000, 5000] })
    ).toBe(45_000)
  })

  it("never goes negative", () => {
    expect(
      loanOutstanding({ principal: 10_000, monthlyInstallment: 5_000, repayments: [5000, 5000, 5000] })
    ).toBe(0)
  })

  it("ignores negative repayment entries", () => {
    expect(
      loanOutstanding({ principal: 10_000, monthlyInstallment: 5_000, repayments: [-100, 0] })
    ).toBe(10_000)
  })
})

describe("installmentDue", () => {
  it("charges the full installment while balance exceeds it", () => {
    expect(installmentDue({ principal: 60_000, monthlyInstallment: 5_000, repayments: [5_000] })).toBe(5_000)
  })

  it("charges only the remaining balance on the final installment", () => {
    expect(
      installmentDue({ principal: 12_000, monthlyInstallment: 5_000, repayments: [10_000] })
    ).toBe(2_000)
  })

  it("is zero once settled", () => {
    expect(
      installmentDue({ principal: 10_000, monthlyInstallment: 5_000, repayments: [10_000] })
    ).toBe(0)
  })

  it("never exceeds net pay capacity (caller caps at netSalary)", () => {
    // Caller-side contract: installmentDue returns the contractual amount;
    // the payroll service caps it at netSalary before deducting.
    expect(installmentDue({ principal: 100_000, monthlyInstallment: 50_000, repayments: [] })).toBe(50_000)
  })
})
