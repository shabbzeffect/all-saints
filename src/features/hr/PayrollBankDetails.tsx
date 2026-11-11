/* PayrollBankDetails - SaintsHub HR Module
 * Staff bank accounts used by the salary disbursement file from a finalized run.
 * Restricted to finance/admin roles (portal:admin:write).
 */
"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Check, Pencil, X, Loader2, Building2 } from "lucide-react"

interface BankRow {
  id: string
  name: string
  email: string | null
  phone: string
  role: string | null
  status: string
  bankName: string | null
  bankBranch: string | null
  bankAccount: string | null
  bankCode: string | null
  complete: boolean
}

interface EditState {
  bankName: string
  bankBranch: string
  bankAccount: string
  bankCode: string
}

export function PayrollBankDetails() {
  const [rows, setRows] = useState<BankRow[]>([])
  const [summary, setSummary] = useState<{ total: number; complete: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<EditState>({ bankName: "", bankBranch: "", bankAccount: "", bankCode: "" })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hr/bank-details", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Could not load bank details" })
        return
      }
      setRows(body?.data ?? [])
      setSummary(body?.summary ?? null)
    } catch {
      setMessage({ tone: "error", text: "Could not load bank details" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startEdit = (row: BankRow) => {
    setEditingId(row.id)
    setEdit({
      bankName: row.bankName ?? "",
      bankBranch: row.bankBranch ?? "",
      bankAccount: row.bankAccount ?? "",
      bankCode: row.bankCode ?? "",
    })
    setMessage(null)
  }

  const save = async (row: BankRow) => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/hr/bank-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: row.id,
          bankName: edit.bankName,
          bankBranch: edit.bankBranch || null,
          bankAccount: edit.bankAccount,
          bankCode: edit.bankCode || null,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ tone: "error", text: body?.error ?? "Could not save bank details" })
        return
      }
      setMessage({ tone: "info", text: `Bank details saved for ${row.name}` })
      setEditingId(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const missing = rows.filter((r) => !r.complete)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Bank details</h2>
        <p className="text-sm text-muted-foreground">
          Salary accounts used by the bank disbursement file from a finalized payroll run.
          Only finance and admin roles can view or edit these.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-md border px-4 py-2 text-sm ${
            message.tone === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-anglican-green-700/30 bg-anglican-green-700/10 text-anglican-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {summary && (
        <Card className={summary.complete < summary.total ? "border-anglican-gold-400/60 bg-anglican-gold-400/5" : undefined}>
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${summary.complete < summary.total ? "text-anglican-gold-600" : "text-anglican-green-700"}`} aria-hidden="true" />
            <p className="text-sm text-anglican-gold-900">
              <strong>{summary.complete} of {summary.total}</strong> staff have complete bank details.
              {missing.length > 0 && (
                <> Missing: {missing.map((m) => m.name).join(", ")}. They will be skipped from the disbursement file until their details are saved.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-anglican-blue-700" aria-hidden="true" />
            Salary accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <TableSkeleton columns={7} rows={8} className="py-3" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isEditing = editingId === row.id
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{row.role ?? "—"}</TableCell>
                      {isEditing ? (
                        <>
                          <TableCell>
                            <Input value={edit.bankName} onChange={(e) => setEdit({ ...edit, bankName: e.target.value })} placeholder="e.g. Equity Bank" aria-label="Bank name" className="w-36" />
                          </TableCell>
                          <TableCell>
                            <Input value={edit.bankBranch} onChange={(e) => setEdit({ ...edit, bankBranch: e.target.value })} placeholder="e.g. Westlands" aria-label="Branch" className="w-32" />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Input value={edit.bankAccount} onChange={(e) => setEdit({ ...edit, bankAccount: e.target.value })} placeholder="0100…" aria-label="Account number" className="w-36 font-mono" inputMode="numeric" />
                              <Input value={edit.bankCode} onChange={(e) => setEdit({ ...edit, bankCode: e.target.value })} placeholder="Bank code (optional)" aria-label="Bank code" className="w-36 font-mono" />
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-sm">{row.bankName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell className="text-sm">{row.bankBranch ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell className="font-mono text-sm">{row.bankAccount ?? <span className="text-muted-foreground">—</span>}</TableCell>
                        </>
                      )}
                      <TableCell className="text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => save(row)} disabled={saving} aria-label="Save bank details">
                              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-anglican-green-700" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={saving} aria-label="Cancel editing">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={row.complete ? "success" : "warning"} size="sm">
                            {row.complete ? "Complete" : "Missing"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isEditing && (
                          <Button variant="ghost" size="sm" onClick={() => startEdit(row)} aria-label={`Edit bank details for ${row.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
