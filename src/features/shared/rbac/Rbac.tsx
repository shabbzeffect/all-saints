/* Rbac - SaintsHub Admin
 * Roles and permissions: live permission catalog from the API plus the
 * system role matrix used across school and parish wings.
 */
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"

interface Permission {
  id: string
  key: string
  name: string
  description: string
  scope: "GLOBAL" | "INSTITUTION" | "RESOURCE"
  isSystem: boolean
}

const DEMO_ROLES = [
  { key: "principal", name: "Principal", description: "Full school administration", priority: 100, isSystem: true },
  { key: "bursar", name: "Bursar", description: "Fees, receipts and finance reports", priority: 80, isSystem: true },
  { key: "teacher", name: "Teacher", description: "Classes, attendance, assessments", priority: 60, isSystem: true },
  { key: "vicar", name: "Vicar", description: "Parish leadership and communications", priority: 100, isSystem: true },
  { key: "treasurer", name: "Treasurer", description: "Parish finance and offerings", priority: 80, isSystem: true },
  { key: "parent", name: "Parent", description: "Own children: fees, reports, receipts", priority: 10, isSystem: true },
]

const SCOPE_VARIANT: Record<Permission["scope"], "primary" | "info" | "secondary"> = {
  GLOBAL: "primary",
  INSTITUTION: "info",
  RESOURCE: "secondary",
}

export function Rbac() {
  const [scope, setScope] = useState("")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/shared/rbac${scope ? `?scope=${scope}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setPermissions(body?.data ?? []))
      .catch(() => setPermissions([]))
      .finally(() => setLoading(false))
  }, [scope])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Roles & Access</h2>
        <p className="text-sm text-muted-foreground">Permission catalog and system roles across both wings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Permissions ({permissions.length})</CardTitle>
            <Select onValueChange={(e) => setScope(e.target.value)} defaultValue="" name="scope" aria-label="Filter by scope">
              <SelectTrigger className="w-44"><SelectValue placeholder="All scopes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All scopes</SelectItem>
                <SelectItem value="GLOBAL">Global</SelectItem>
                <SelectItem value="INSTITUTION">Institution</SelectItem>
                <SelectItem value="RESOURCE">Resource</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead className="text-center">Scope</TableHead>
                  <TableHead className="text-center">System</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <div className="font-medium">{perm.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{perm.key}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={SCOPE_VARIANT[perm.scope] ?? "secondary"} size="sm">{perm.scope}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {perm.isSystem ? <Badge variant="secondary" size="sm">System</Badge> : <span className="text-xs text-muted-foreground">Custom</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && permissions.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No permissions found.</p>
            )}
            {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading permissions…</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> System Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_ROLES.map((role) => (
              <div key={role.key} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{role.name}</p>
                  <span className="text-xs text-muted-foreground">Priority {role.priority}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{role.description}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{role.key}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
