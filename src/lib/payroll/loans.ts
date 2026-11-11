/* loans.ts
 * Salary loan math — pure functions, unit tested in tests/unit/loans.test.ts
 * Outstanding balance is derived: principal − sum of repayments recorded
 * against FINAL payslips. DRAFT runs are excluded so recompute self-corrects.
 */

export interface LoanMathInput {
  principal: number
  monthlyInstallment: number
  repayments: number[] // repayments against FINAL payslips only
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Outstanding balance for a loan (never negative) */
export function loanOutstanding({ principal, repayments }: LoanMathInput): number {
  const paid = repayments.reduce((sum, r) => sum + Math.max(0, r), 0)
  return round2(Math.max(0, principal - paid))
}

/** Installment due this period, capped at the outstanding balance */
export function installmentDue(loan: LoanMathInput): number {
  const outstanding = loanOutstanding(loan)
  if (outstanding <= 0) return 0
  return round2(Math.min(Math.max(0, loan.monthlyInstallment), outstanding))
}
