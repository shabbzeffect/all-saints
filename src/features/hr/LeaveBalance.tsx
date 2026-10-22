/* eslint-disable react/prop-types */
/* HR Leave Balance - SaintsHub */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UseCase } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"

interface LeaveBalanceRow {
  leaveType: string
  entitlement: number
  used: number
  remaining: number
  pending: number
  status: "available" | "exhausted" | "limited"
}

interface LeaveBalanceProps {
  staffId: string
  staffName: string
}

export function LeaveBalance({ staffId, staffName }: LeaveBalanceProps) {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<LeaveBalanceRow[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      // Fetch leave types
      const ltRes = await fetch("/api/hr?action=leave-types", {
        headers: { "Content-Type": "application/json" },
      })
      const leaveTypes = await ltRes.json()
      const ltMap = new Map(leaveTypes.map((lt: any) => [lt.key, lt.name]))

      // Fetch leave requests
      const reqRes = await fetch("/api/hr?action=leave-requests&staffId=" + staffId, {
        headers: { "Content-Type": "application/json" },
      })
      const requests = await reqRes.json()

      // Calculate balance per leave type
      const entitlements = new Map<string, number>()
      const used = new Map<string, number>()
      const pending = new Map<string, number>()

      // Default entitlements (would come from leaveType config)
      const defaults: { [key: string]: number } = {
        annual: 21,
        sick: 7,
        personal: 5,
        compassionate: 3,
      }

      for (const lt of leaveTypes) {
        const key = lt.key
        entitlements.set(key, defaults[key] || 21)
      }

      // Count used and pending days
      for (const r of requests) {
        const key = r.leaveType.key || "annual"
        const days = r.daysRequested || 0

        if (r.status === "APPROVED") {
          used.set(key, (used.get(key) || 0) + days)
        }
        if (r.status === "PENDING") {
          pending.set(key, (pending.get(key) || 0) + days)
        }
      }

      // Build balance rows
      const rows: LeaveBalanceRow[] = []
      for (const [key, name] of ltMap) {
        const ent = entitlements.get(key) || 21
        const u = used.get(key) || 0
        const p = pending.get(key) || 0
        const r = ent - u

        let status: "available" | "exhausted" | "limited" = "available"
        if (r <= 0) status = "exhausted"
        else if (r < 5) status = "limited"

        rows.push({
          leaveType: name,
          entitlement: ent,
          used: u,
          remaining: r,
          pending: p,
          status,
        })
      }

      setBalance(rows)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch leave balance", error)
      toast({
        title: "Error",
        description: "Failed to load leave balance",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-8 w-8 mx-auto mb-4" />
        <p className="text-muted dark:text-muted-foreground/60">Loading leave balance...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
        Leave Balance - {staffName}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
        </Header>
        <CardContent>
          {balance.length === 0 ? (
            <p className="text-muted dark:text-muted-foreground/60">
              No balance data available. Configure leave types first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell className="text-right">Entitlement</TableCell>
                  <TableCell className="text-right">Used</TableCell>
                  <TableCell className="text-right">Remaining</TableCell>
                  <TableCell className="text-right">Pending</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balance.map((b) => (
                  <TableRow key={b.leaveType} className="hover:bg-angle/5 dark:hover:bg-angle/80">
                    <TableCell>{b.leaveType}</TableCell>
                    <TableCell className="text-right font-medium">
                      {b.entitlement} days
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted/60">{b.used} days</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {b.remaining} days
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted/60">{b.pending} pending</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.status}
                        size="sm"
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}