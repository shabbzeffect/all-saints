/* HR Annual Tax Summary API - SaintsHub
 * GET /api/hr/payroll/annual?year=2026&format=json|csv
 * P9-style consolidated annual return per staff (FINAL payslips only).
 */

import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { resolveInstitutionId, getAnnualTaxReport } from "@/server/services/hr/payroll.service"
import { toCsv, csvResponse } from "@/lib/csv"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = await resolveInstitutionId(searchParams.get("institutionId"))
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10)
    const format = searchParams.get("format") === "csv" ? "csv" : "json"

    const [report, institution] = await Promise.all([
      getAnnualTaxReport(institutionId, year),
      prisma.institution.findUnique({ where: { id: institutionId }, select: { name: true } }),
    ])

    if (format === "json") {
      return NextResponse.json({ success: true, data: report })
    }

    const institutionName = institution?.name ?? "All Saints Mushililie Academy"
    const headers = [
      "Employee",
      "Email",
      "Designation",
      "Employment",
      "Months paid",
      "Basic salary",
      "Gross pay",
      "Allowances",
      "PAYE",
      "NSSF (employee)",
      "NSSF (employer)",
      "SHIF",
      "Housing Levy (employee)",
      "Housing Levy (employer)",
      "Total deductions",
      "Net pay",
    ]
    const rows: (string | number | null)[][] = [
      [`Annual tax summary (P9) — ${year}`],
      ["Institution", institutionName],
      ["Finalized months", report.rows.reduce((m, r) => Math.max(m, r.monthsPaid), 0)],
      ["Staff returned", report.rows.length],
      ["Generated", report.generatedAt.slice(0, 10)],
      [],
      headers,
    ]
    for (const r of report.rows) {
      rows.push([
        r.name,
        r.email ?? "",
        r.role,
        r.employmentType,
        r.monthsPaid,
        r.basicSalary,
        r.grossPay,
        r.allowances,
        r.paye,
        r.nssfEmployee,
        r.nssfEmployer,
        r.shif,
        r.housingLevy,
        r.housingLevyEmployer,
        r.totalDeductions,
        r.netPay,
      ])
    }
    rows.push([
      "TOTAL",
      "",
      "",
      "",
      report.totals.monthsPaid,
      report.totals.basicSalary,
      report.totals.grossPay,
      report.totals.allowances,
      report.totals.paye,
      report.totals.nssfEmployee,
      report.totals.nssfEmployer,
      report.totals.shif,
      report.totals.housingLevy,
      report.totals.housingLevyEmployer,
      report.totals.totalDeductions,
      report.totals.netPay,
    ])

    return csvResponse(`p9-${year}.csv`, toCsv(rows))
  } catch (error: any) {
    const msg = error?.message ?? "Failed to generate annual summary"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
