/* UsersPage.tsx
 * Admin - Users management page
 * Provides: List of users, search, filter, actions
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
}

interface UsersFilter {
  searchTerm?: string
  role?: string
  status?: "active" | "inactive"
}

export function UsersPage() {
  const [filter, setFilter] = useState<UsersFilter>({})
  const [users, setUsers] = useState<User[]>([])

  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Fetch users from API
    fetch(`/api/admin/users${searchTerm ? `?search=${searchTerm}` : ""}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Failed to fetch users:", err))
  }, [searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setFilter({ ...filter, searchTerm: e.target.value })
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, role: e.target.value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, status: e.target.value as "active" | "inactive" })
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="w-full"
            />

            <Select
              onValueChange={handleRoleChange}
              defaultValue=""
              name="role"
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={handleStatusChange}
              defaultValue=""
              name="status"
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableClassName>User</TableClassName>
                <TableCell>Name</TableCell>
                <TableCell className="text-right">Email</TableCell>
                <TableCell className="text-center">Role</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell className="text-right">Last Login</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={user.status === "active" ? "default" : "secondary"}
                      size="sm"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">{user.lastLogin}</div>
                    <div className="text-xs text-muted/60">{user.createdAt}</div>
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

          {/* No users message */}
          {users.length === 0 && (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No users found. Create a user first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

UsersPage.displayName = "UsersPage"