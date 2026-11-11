/* HR Payroll Export API - SaintsHub
 * GET /api/hr/payroll/[runId]/export?format=register|remittance|bank
 * register|remittance: payroll register and P10A-style statutory summary [hr:payroll:read]
 * bank: salary disbursement file for a finalized run                 [portal:admin:write]
 */

import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requirePayroll } from "@/server/payroll-access"
import { requireAccess } from "@/server/rbac"
import { getPayrollRun } from "@/server/services/hr/payroll.service"
import { getDisbursementForRun } from "@/server/services/hr/banking.service"
import { toCsv, csvResponse } from "@/lib/csv"

export const dynamic = "force-dynamic"

const sumLine = (
  lines: { amount: number; type: string; taxCategory: string | null }[],
  taxCategory: string,
  type?: "ALLOWANCE" | "DEDUCTION" | "EMPLOYER"
) =>
  lines
    .filter((l) => l.taxCategory === taxCategory && (!type || l.type === type))
    .reduce((sum, l) => sum + l.amount, 0)

const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const { searchParams } = new URL(request.url)
  const format =
    searchParams.get("format") === "remittance"
      ? "remittance"
      : searchParams.get("format") === "bank"
        ? "bank"
        : "register"

  // The bank disbursement file moves real money — require admin rights for it
  if (format === "bank") {
    const adminGate = await requireAccess("portal:admin:write")
    if ("error" in adminGate) return adminGate.error
  }

  const gate = await requirePayroll("hr:payroll:read")
  if ("error" in gate) return gate.error
  const { institutionId } = gate.access

  try {
    // Bank disbursement file — finance admin only, COMPLETED runs only
    if (format === "bank") {
      const d = await getDisbursementForRun({ runId: params.runId, institutionId })
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { name: true },
      })
      const institutionName = institution?.name ?? "All Saints Mushililie Academy"
      const [y, m] = d.run.period.split("-").map((n) => parseInt(n, 10))
      const MONTHS = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ]
      const periodLabel = y && m ? `${MONTHS[m - 1]} ${y}` : d.run.period
      const payDate = new Date(d.run.payDate).toISOString().slice(0, 10)

      const rows: (string | number | null)[][] = [
        ["Salary disbursement file"],
        ["Institution", institutionName],
        ["Period", d.run.period],
        ["Pay date", payDate],
        ["Run status", d.run.status],
        ["Staff with bank details", d.ready.length],
        ["Staff skipped (missing bank details)", d.missing.length],
        [],
        ["Account Name", "Account Number", "Bank", "Branch", "Amount (KES)", "Reference", "Narration"],
      ]
      for (const r of d.ready) {
        rows.push([
          r.employee,
          r.bankAccount ?? "",
          r.bankName ?? "",
          r.bankBranch ?? "",
          money(r.netSalary),
          `SAL-${d.run.period}`,
          `${periodLabel} salary`,
        ])
      }
      rows.push(["TOTAL", "", "", "", money(d.disbursableNet), "", ""])
      rows.push([])
      if (d.missing.length > 0) {
        rows.push(["Staff skipped (no bank details — NOT in this file)"])
        rows.push(["Employee", "Designation", "Net pay (KES)"])
        for (const r of d.missing) {
          rows.push([r.employee, r.role, money(r.netSalary)])
        }
      }
      rows.push([])
      rows.push([
        "Memo: upload through your bank's salary/EFT template. Verify the file totals before submitting. Staff listed as skipped must update Bank Details before the next run.",
      ])

      return csvResponse(`salary-disbursement-${d.run.period}.csv`, toCsv(rows))
    }

    const [run, institution] = await Promise.all([
      getPayrollRun({ runId: params.runId, institutionId }),
      prisma.institution.findUnique({ where: { id: institutionId }, select: { name: true } }),
    ])

    const institutionName = institution?.name ?? "All Saints Mushililie Academy"
    const payDate = new Date(run.payDate).toISOString().slice(0, 10)
    const payslips = [...run.payslips].sort((a, b) =>
      (a.staff.user.name ?? "").localeCompare(b.staff.user.name ?? "")
    )

    if (format === "register") {
      const headers = [
        "Employee",
        "Email",
        "Designation",
        "Employment",
        "Basic salary",
        "Gross pay",
        "PAYE",
        "NSSF (employee)",
        "SHIF",
        "Housing Levy",
        "Loan repayments",
        "Unpaid leave",
        "Total deductions",
        "Net pay",
        "Employer cost",
      ]
      const rows: (string | number | null)[][] = [
        ["Payroll register"],
        ["Institution", institutionName],
        ["Period", run.period],
        ["Pay date", payDate],
        ["Run status", run.status],
        ["Staff", payslips.length],
        [],
        headers,
      ]

      for (const slip of payslips) {
        const unpaid = Math.abs(sumLine(slip.lines, "UNPAID_LEAVE"))
        const loans = money(sumLine(slip.lines, "LOAN", "DEDUCTION"))
        rows.push([
          slip.staff.user.name ?? "Staff",
          slip.staff.user.email ?? "",
          slip.staff.role?.name ?? "",
          slip.staff.employmentType?.name ?? "",
          slip.basicSalary,
          slip.grossSalary,
          money(sumLine(slip.lines, "PAYE")),
          money(sumLine(slip.lines, "NSSF", "DEDUCTION")),
          money(sumLine(slip.lines, "SHIF")),
          money(sumLine(slip.lines, "HOUSING_LEVY", "DEDUCTION")),
          loans,
          unpaid,
          slip.totalDeductions,
          slip.netSalary,
          slip.employerCost,
        ])
      }

      rows.push([
        "TOTAL",
        "",
        "",
        "",
        money(sumOn(payslips, (s) => s.basicSalary)),
        money(sumOn(payslips, (s) => s.grossSalary)),
        money(sumOn(payslips, (s) => sumLine(s.lines, "PAYE"))),
        money(sumOn(payslips, (s) => sumLine(s.lines, "NSSF", "DEDUCTION"))),
        money(sumOn(payslips, (s) => sumLine(s.lines, "SHIF"))),
        money(sumOn(payslips, (s) => sumLine(s.lines, "HOUSING_LEVY", "DEDUCTION"))),
        money(sumOn(payslips, (s) => sumLine(s.lines, "LOAN", "DEDUCTION"))),
        money(sumOn(payslips, (s) => Math.abs(sumLine(s.lines, "UNPAID_LEAVE")))),
        money(sumOn(payslips, (s) => s.totalDeductions)),
        money(sumOn(payslips, (s) => s.netSalary)),
        money(sumOn(payslips, (s) => s.employerCost)),
      ])

      return csvResponse(`payroll-${run.period}-register.csv`, toCsv(rows))
    }

    // Statutory remittance summary (per PAYE P10A / NSSF / SHIF / Housing Levy)
    const paye = money(sumOn(payslips, (s) => sumLine(s.lines, "PAYE")))
    const nssfEmployee = money(sumOn(payslips, (s) => sumLine(s.lines, "NSSF", "DEDUCTION")))
    const nssfEmployer = money(sumOn(payslips, (s) => sumLine(s.lines, "NSSF", "EMPLOYER")))
    const shif = money(sumOn(payslips, (s) => sumLine(s.lines, "SHIF")))
    const levyEmployee = money(sumOn(payslips, (s) => sumLine(s.lines, "HOUSING_LEVY", "DEDUCTION")))
    const levyEmployer = money(sumOn(payslips, (s) => sumLine(s.lines, "HOUSING_LEVY", "EMPLOYER")))

    const rows: (string | number)[][] = [
      ["Statutory remittance summary"],
      ["Institution", institutionName],
      ["Period", run.period],
      ["Pay date", payDate],
      ["Staff count", payslips.length],
      ["Run status", run.status],
      [],
      ["Statutory item", "Employee portion", "Employer portion", "Total due"],
      ["PAYE (KRA)", paye, 0, paye],
      ["NSSF", nssfEmployee, nssfEmployer, money(nssfEmployee + nssfEmployer)],
      ["SHIF", shif, 0, shif],
      ["Affordable Housing Levy", levyEmployee, levyEmployer, money(levyEmployee + levyEmployer)],
      [
        "TOTAL REMITTANCES",
        money(paye + nssfEmployee + shif + levyEmployee),
        money(nssfEmployer + levyEmployer),
        money(paye + nssfEmployee + nssfEmployer + shif + levyEmployee + levyEmployer),
      ],
      [],
      ["Memo: remit PAYE (P11), NSSF, SHIF and Housing Levy to the respective agencies by the 9th of the following month."],
    ]

    return csvResponse(`payroll-${run.period}-remittance.csv`, toCsv(rows))
  } catch (error: any) {
    const msg = error?.message ?? "Failed to export payroll"
    return NextResponse.json({ success: false, error: msg }, { status: msg.includes("not found") ? 404 : 500 })
  }
}

function sumOn<T>(items: T[], fn: (item: T) => number): number {
  return items.reduce((sum, item) => sum + fn(item), 0)
}
