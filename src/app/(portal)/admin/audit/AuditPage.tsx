/* AuditPage.tsx
 * Admin - Audit logs page
 * Provides: System audit logs, filtering, search, export
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface AuditLog {
  id: string
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT"
  user: string
  target: string
  details: string
  ip: string
  timestamp: string
  status: "success" | "failed"
}

interface AuditFilter {
  action?: string
  user?: string
  startDate?: string
  endDate?: string
}

export function AuditPage() {
  const [filter, setFilter] = useState<AuditFilter>({})
  const [logs, setLogs] = useState<AuditLog[]>([])

  const [actionFilter, setActionFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetch(`/api/admin/audit${userFilter || startDate || endDate ? `?action=${actionFilter}&user=${userFilter}&start=${startDate}&end=${endDate}` : ""}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error("Failed to fetch audit logs:", err))
  }, [actionFilter, userFilter, startDate, endDate])

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionFilter(e.target.value)
    setFilter({ ...filter, action: e.target.value })
  }

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFilter(e.target.value)
    setFilter({ ...filter, user: e.target.value })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "start") {
      setStartDate(e.target.value)
    } else {
      setEndDate(e.target.value)
    }
    setFilter({ ...filter, [e.target.name]: e.target.value })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
            <Select
              onValueChange={handleActionChange}
              defaultValue=""
              name="action"
            >
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="User"
              value={userFilter}
              onValueChange={handleUserChange}
              placeholderClassName="w-full"
              className="w-full"
            />

            <div className="flex gap-2">
              <input
                type="date"
                name="start"
                value={startDate}
                onChange={handleDateChange}
                className="flex-1 rounded-md border border-border-dark/30 dark:border-border-dark/10 py-2 px-3 text-sm"
              />
              <span className="text-sm text-muted/60">to</span>
              <input
                type="date"
                name="end"
                value={endDate}
                onChange={handleDateChange}
                className="flex-1 rounded-md border border-border-dark/30 dark:border-border-dark/10 py-2 px-3 text-sm"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableClassName>Log</TableClassName>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell className="text-right">IP</TableCell>
                <TableCell className="text-right">Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Badge
                      variant={log.action === "DELETE" ? "destructive" : log.action === "EXPORT" ? "default" : log.status === "success" ? "default" : "secondary"}
                      size="sm"
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell className="text-right">{log.ip}</TableCell>
                  <TableCell className="text-right">{formatDate(log.timestamp)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={log.status === "success" ? "default" : "secondary"}
                      size="sm"
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="link"
                      className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {logs.length === 0 && (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No audit logs found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

AuditPage.displayName = "AuditPage"