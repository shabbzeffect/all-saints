/* eslint-disable react/prop-types */
/* HR Staff Directory - SaintsHub */
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UseCase } from "lucide-react"
import { useState, useEffect } from "react"

interface StaffMember {
  id: string
  user: { id: string; email: string; name: string; phone: string }
  role: { key: string; name: string }
  employmentType: { key: string; name: string }
  dateOfJoining: Date
  phone: string
  address?: string
  status: string
  leaveBalance?: { annual: number; sick: number; pending: number }
}

interface StaffDirectoryProps {
  staff: StaffMember[]
  onView: (staffId: string) => void
}

export function StaffDirectory({ staff, onView }: StaffDirectoryProps) {
  const [search, setSearch] = useState("")

  const filtered = staff.filter(
    (s) =>
      s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Staff Directory
        </h1>
        <Input
          placeholder="Search staff name, email, or role..."
          value={search}
          onValueChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted dark:text-muted-foreground/60">
              No staff found. Add staff members first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell className="text-right">Role</TableCell>
                  <TableCell className="text-right">Type</TableCell>
                  <TableCell className="text-right">Joined</TableCell>
                  <TableCell className="text-right">Phone</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-angle/5 dark:hover:bg-angle/80">
                    <TableCell>
                      <div className="font-medium">{s.user.name}</div>
                      <div className="text-xs text-muted/60">{s.user.email}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-anglican-blue font-sm">{s.role.name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-muted/60">
                        {s.employmentType.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-sm">
                        {new Date(s.dateOfJoining).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "short",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm">{s.phone}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => onView(s.id)}
                        className="text-anglican-blue/60 hover:text-anglican-blue"
                        aria-label="View staff details"
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
          )}
        </CardContent>
      </Card>

      {staff.length > 0 && (
        <p className="mt-4 text-sm text-muted/60 dark:text-muted/40">
          {staff.length} staff member(s) total
        </p>
      )}
    </div>
  )
}