/* PayslipDocument - SaintsHub HR Module
 * Printable payslip on All Saints Mushililie Academy letterhead.
 * Shared by the payroll admin view and the staff self-service view.
 */
"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"
import { formatCurrency } from "@/lib/config"

export interface PayslipDocumentLine {
  id: string
  description: string
  amount: number
  type: string // ALLOWANCE | DEDUCTION | EMPLOYER
  taxCategory: string | null
}

export interface PayslipDocumentData {
  id: string
  basicSalary: number
  grossSalary: number
  totalDeductions: number
  netSalary: number
  payDate: string
  staff: {
    id: string
    user: { name: string | null; email: string | null }
    role: { name: string } | null
    employmentType: { name: string } | null
  }
  lines: PayslipDocumentLine[]
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })

export function PayslipDocument({
  payslip,
  periodLabel,
  onClose,
}: {
  payslip: PayslipDocumentData
  periodLabel: string
  onClose: () => void
}) {
  const earnings = useMemo(() => payslip.lines.filter((l) => l.type === "ALLOWANCE"), [payslip])
  const deductions = useMemo(() => payslip.lines.filter((l) => l.type === "DEDUCTION"), [payslip])
  const employerLines = useMemo(() => payslip.lines.filter((l) => l.type === "EMPLOYER"), [payslip])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 print:static print:items-stretch print:bg-transparent print:p-0">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Payslip for ${payslip.staff.user.name ?? "staff"}`}
        className="w-full max-w-2xl rounded-xl bg-white text-gray-900 shadow-2xl print:max-w-none print:rounded-none print:shadow-none"
      >
        <div id="payslip-print-area" className="bg-white p-6 text-gray-900 sm:p-8">
          {/* Letterhead */}
          <div className="border-b-2 border-[#1f2a44] pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-lg font-bold text-[#1f2a44]">ALL SAINTS MUSHILILIE ACADEMY</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">All Saints Mushililie · Payroll Office</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1f2a44]">PAYSLIP</p>
                <p className="text-xs text-gray-500">{periodLabel}</p>
              </div>
            </div>
          </div>

          {/* Employee block */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Employee</p>
              <p className="font-semibold">{payslip.staff.user.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Designation</p>
              <p className="font-semibold">{payslip.staff.role?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Employment</p>
              <p className="font-semibold">{payslip.staff.employmentType?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Pay date</p>
              <p className="font-semibold">{formatDate(payslip.payDate)}</p>
            </div>
          </div>

          {/* Earnings & deductions */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-700">Earnings</p>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {earnings.map((line) => (
                    <tr key={line.id} className="border-b border-gray-100">
                      <td className="py-1.5">{line.description}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-1.5">Gross pay</td>
                    <td className="py-1.5 text-right tabular-nums">{formatCurrency(payslip.grossSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-700">Deductions</p>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {deductions.map((line) => (
                    <tr key={line.id} className="border-b border-gray-100">
                      <td className="py-1.5">{line.description}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-1.5">Total deductions</td>
                    <td className="py-1.5 text-right tabular-nums">{formatCurrency(payslip.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net pay box */}
          <div className="mt-5 flex items-center justify-between rounded-lg border-2 border-[#1f2a44] px-4 py-3">
            <span className="text-sm font-bold uppercase tracking-wide text-[#1f2a44]">Net pay</span>
            <span className="text-xl font-bold tabular-nums text-[#1f2a44]">{formatCurrency(payslip.netSalary)}</span>
          </div>

          {/* Employer contributions */}
          {employerLines.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Employer contributions (not deducted)</p>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
                {employerLines.map((line) => (
                  <span key={line.id}>
                    {line.description}: <span className="font-semibold tabular-nums">{formatCurrency(line.amount)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 border-t border-gray-200 pt-3 text-center text-[10px] text-gray-500">
            Generated by SaintsHub on {new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })} · This payslip is computer-generated
          </p>
        </div>

        {/* Overlay actions — hidden when printing */}
        <div className="print-hidden flex items-center justify-end gap-2 border-t border-gray-200 p-4">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          <Button size="sm" onClick={onClose}>
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
