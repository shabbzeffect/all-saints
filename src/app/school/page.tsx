import Link from "next/link"
import { GraduationCap, Users, Wallet, AlertCircle, ArrowRight, Receipt } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { prisma } from "@/server/db"
import { scopedInstitutionId } from "@/server/rbac"
import { formatCurrency } from "@/lib/config"

const kes = (v: unknown) => formatCurrency(Number(v ?? 0) / 100)

export default async function SchoolPage() {
  const institutionId = await scopedInstitutionId()
  if (!institutionId) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">School Dashboard</h2>
        <p className="text-sm text-muted-foreground">Sign in with a staff account to see live figures.</p>
      </div>
    )
  }

  const [active, withdrawn, total, collected, invoiced, outstandingAgg, outstandingCount, recentPayments] =
    await Promise.all([
      prisma.student.count({ where: { institutionId, status: "ACTIVE" } }),
      prisma.student.count({ where: { institutionId, status: "WITHDRAWN" } }),
      prisma.student.count({ where: { institutionId } }),
      prisma.payment.aggregate({ where: { institutionId }, _sum: { amount: true }, _count: true }),
      prisma.invoice.aggregate({ where: { institutionId }, _sum: { totalAmount: true } }),
      prisma.invoice.aggregate({ where: { institutionId, amountRemaining: { gt: 0 } }, _sum: { amountRemaining: true } }),
      prisma.invoice.count({ where: { institutionId, amountRemaining: { gt: 0 } } }),
      prisma.payment.findMany({
        where: { institutionId },
        orderBy: { transactionDate: "desc" },
        take: 5,
        include: {
          student: { select: { firstName: true, lastName: true, admissionNumber: true } },
          receipt: { select: { receiptNumber: true } },
        },
      }),
    ])

  const collectedKes = Number(collected._sum.amount ?? 0) / 100
  const invoicedKes = Number(invoiced._sum.totalAmount ?? 0) / 100
  const outstandingKes = Number(outstandingAgg._sum.amountRemaining ?? 0) / 100
  const collectionPct = invoicedKes > 0 ? Math.min(100, Math.round((collectedKes / invoicedKes) * 100)) : 0

  const metrics = [
    { label: "Active Students", value: String(active), sub: `${withdrawn} withdrawn in 2026`, icon: GraduationCap },
    { label: "Total Learners", value: String(total), sub: "imported register, all grades", icon: Users },
    { label: "Fees Collected", value: formatCurrency(collectedKes), sub: `${collected._count} receipts issued`, icon: Wallet },
    { label: "Arrears Outstanding", value: formatCurrency(outstandingKes), sub: `${outstandingCount} learners owing`, icon: AlertCircle },
  ]

  const links = [
    { title: "Students", href: "/school/students" },
    { title: "Attendance", href: "/school/attendance" },
    { title: "Academics", href: "/school/academics" },
    { title: "School Finance", href: "/school/finance" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">School Dashboard</h2>
        <p className="text-sm text-muted-foreground">Term 3 · 2026 — live figures from the school ledger</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.sub}</p>
              </div>
              <metric.icon className="h-6 w-6 text-anglican-blue-700" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Receipts</CardTitle>
            <Link href="/school/finance" className="flex items-center gap-1 text-xs font-medium text-anglican-blue-700 hover:underline">
              All payments <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium">
                        {p.student.firstName} {p.student.lastName}
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{p.student.admissionNumber}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.receipt?.receiptNumber ?? "—"} · {p.method.replace(/_/g, " ")} · {new Date(p.transactionDate).toLocaleDateString("en-KE")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{kes(p.amount)}</p>
                </li>
              ))}
              {recentPayments.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">No payments recorded yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Fee Collection</CardTitle>
            <Link href="/school/finance" className="flex items-center gap-1 text-xs font-medium text-anglican-blue-700 hover:underline">
              Finance <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.min(collectionPct, 100)}%</p>
            <p className="text-xs text-muted-foreground">of 2026 fees invoiced</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-anglican-green-600" style={{ width: `${collectionPct}%` }} />
            </div>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Collected</dt><dd className="font-medium">{formatCurrency(collectedKes)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Invoiced</dt><dd className="font-medium">{formatCurrency(invoicedKes)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Arrears</dt><dd className="font-medium text-destructive">{formatCurrency(outstandingKes)}</dd></div>
            </dl>
            <p className="mt-3 text-[11px] text-muted-foreground">Collected can exceed 100% where learners overpaid; arrears exclude credit balances.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-full border border-border px-4 py-1.5 font-medium text-anglican-blue-800 transition-colors hover:bg-anglican-blue-50">
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
