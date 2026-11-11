/* Banking Service - SaintsHub HR
 * Staff bank accounts (for salary disbursement) and the per-run disbursement file.
 * Every query is institution-scoped via the caller's active membership.
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/server/db"

// ============================================================================
// BANK DETAILS ADMIN
// ============================================================================

export async function listBankDetails(institutionId: string) {
  const staff = await prisma.staff.findMany({
    where: { institutionId },
    include: {
      user: { select: { name: true, email: true } },
      role: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  })
  return staff.map((s) => ({
    id: s.id,
    name: s.user?.name ?? "Staff",
    email: s.user?.email ?? null,
    phone: s.phone,
    role: s.role?.name ?? null,
    status: s.status,
    bankName: s.bankName,
    bankBranch: s.bankBranch,
    bankAccount: s.bankAccount,
    bankCode: s.bankCode,
    complete: Boolean(s.bankName?.trim() && s.bankAccount?.trim()),
  }))
}

export interface BankDetailsInput {
  bankName: string
  bankBranch?: string | null
  bankAccount: string
  bankCode?: string | null
}

export async function updateStaffBankDetails({
  institutionId,
  staffId,
  data,
  actorId,
}: {
  institutionId: string
  staffId: string
  data: BankDetailsInput
  actorId?: string
}) {
  const bankName = (data.bankName ?? "").trim()
  const bankBranch = data.bankBranch?.trim() || null
  const bankCode = data.bankCode?.trim() || null
  const bankAccount = (data.bankAccount ?? "").replace(/[\s-]/g, "")

  if (bankName.length < 2) throw new Error("Bank name is required")
  if (!/^\d{5,20}$/.test(bankAccount)) throw new Error("Account number must be 5-20 digits")

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, institutionId },
    include: { user: { select: { name: true } } },
  })
  if (!staff) throw new Error("Staff member not found in this institution")

  const result = await prisma.staff.updateMany({
    where: { id: staffId, institutionId },
    data: { bankName, bankBranch, bankAccount, bankCode },
  })
  if (result.count === 0) throw new Error("Staff member not found in this institution")

  await prisma.auditEvent.create({
    data: {
      actorId: actorId ?? null,
      action: "UPDATE",
      targetType: "Staff",
      targetName: staff.user?.name ?? staffId,
      institutionId,
      metadata: { action: "bank_details_updated", staffId, bankName, hasBankCode: !!bankCode },
    },
  })

  return listBankDetails(institutionId).then((rows) => rows.find((r) => r.id === staffId))
}

// ============================================================================
// DISBURSEMENT FILE (COMPLETED runs only)
// ============================================================================

export interface DisbursementRow {
  employee: string
  role: string
  netSalary: number
  bankName: string | null
  bankBranch: string | null
  bankAccount: string | null
  bankCode: string | null
  ready: boolean
}

/** Bank disbursement rows for a finalized run — splits into ready/missing */
export async function getDisbursementForRun({
  runId,
  institutionId,
}: {
  runId: string
  institutionId: string
}) {
  const run = await prisma.payrollRun.findFirst({ where: { id: runId, institutionId } })
  if (!run) throw new Error("Payroll run not found")
  if (run.status !== "COMPLETED") {
    throw new Error("Bank disbursement is only available for a finalized (COMPLETED) run")
  }

  const payslips = await prisma.payslip.findMany({
    where: { payrollRunId: run.id, status: "FINAL" },
    select: {
      netSalary: true,
      staff: {
        select: {
          bankName: true,
          bankBranch: true,
          bankAccount: true,
          bankCode: true,
          user: { select: { name: true } },
          role: { select: { name: true } },
        },
      },
    },
    orderBy: [{ staff: { user: { name: "asc" } } }],
  })

  const rows: DisbursementRow[] = payslips.map((p) => ({
    employee: p.staff.user?.name ?? "Staff",
    role: p.staff.role?.name ?? "—",
    netSalary: p.netSalary,
    bankName: p.staff.bankName,
    bankBranch: p.staff.bankBranch,
    bankAccount: p.staff.bankAccount,
    bankCode: p.staff.bankCode,
    ready: Boolean(p.staff.bankAccount?.trim() && p.staff.bankName?.trim()),
  }))

  const ready = rows.filter((r) => r.ready)
  const missing = rows.filter((r) => !r.ready)
  const totalNet = rows.reduce((sum, r) => sum + r.netSalary, 0)
  const disbursableNet = ready.reduce((sum, r) => sum + r.netSalary, 0)

  return { run, rows, ready, missing, totalNet, disbursableNet }
}
