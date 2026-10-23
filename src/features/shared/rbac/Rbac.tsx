/* Shared RBAC - SaintsHub Platform
Provides: Permissions and role management
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Permission {
  id: string
  key: string
  name: string
  description: string
  scope: "GLOBAL" | "INSTITUTION" | "RESOURCE"
  resource?: string
  action?: string
  isSystem: boolean
}

interface Role {
  id: string
  key: string
  name: string
  description: string
  institutionId?: string
  isSystem: boolean
  priority: number
}

interface UserRoleAssignment {
  id: string
  userId: string
  roleId: string
  assignedAt: string
  assignedBy: string
}

interface PermissionFilter {
  scope?: "GLOBAL" | "INSTITUTION" | "RESOURCE"
  isSystem?: boolean
}

interface RoleFilter {
  isSystem?: boolean
}

export function Rbac() {
  const [filters, setFilters] = useState<PermissionFilter>({
    scope: "",
    isSystem: undefined,
  })
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const scope = searchParams.get("scope") as "GLOBAL" | "INSTITUTION" | "RESOURCE" || ""
    const isSystem = searchParams.get("isSystem")
    setFilters({ scope, isSystem: isSystem === "true" })
  }, [searchParams])

  const fetchPermissions = useCallback(async () => {
    const response = await fetch(`/api/shared/rbac${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setPermissions(data.data?.permissions || [])
    setRoles(data.data?.roles || [])
    setAssignments(data.data?.assignments || [])
  }, [searchParams])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const filteredPermissions = permissions.filter((permission) => {
    const matchesScope = filters.scope ? permission.scope === filters.scope : true
    const matchesIsSystem = filters.isSystem !== undefined ? permission.isSystem === filters.isSystem : true
    return matchesScope && matchesIsSystem
  })

  const filteredRoles = roles.filter((role) => {
    const matchesIsSystem = filters.isSystem !== undefined ? role.isSystem === filters.isSystem : true
    return matchesIsSystem
  })

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value
      const name = (e.target as HTMLInputElement | HTMLSelectElement).name
      setFilters((prev) => ({
        ...prev,
        [name]: name === "isSystem" ? (value === "true") : value,
      }))
    },
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      // Could implement search if needed
    },
    []
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-purple dark:text-anglican-purple-100">
          RBAC & Permissions
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Roles, permissions & assignments
        </p>
      </header>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPermissions.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No permissions found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Permission</TableClassName>
                  <TableCell className="text-center">Scope</TableCell>
                  <TableCell className="text-center">System</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow
                    key={permission.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{permission.key}</div>
                      <div className="text-xs text-muted/60">{permission.name}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={permission.isSystem ? "default" : "secondary"}
                        size="sm"
                      >
                        {permission.isSystem ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria="View permission details"
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

      {/* Roles */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No roles found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Role</TableClassName>
                  <TableCell className="text-center">System</TableCell>
                  <TableCell className="text-center">Priority</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow
                    key={role.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{role.key}</div>
                      <div className="text-xs text-muted/60">{role.name}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={role.isSystem ? "default" : "secondary"}
                        size="sm"
                      >
                        {role.isSystem ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">{role.priority}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria="View role details"
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

      {/* Assignments */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Role Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No role assignments found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>User</TableClassName>
                  <TableCell className="text-center">Role</TableCell>
                  <TableCell className="text-center">Assigned At</TableCell>
                  <TableCell className="text-center">Assigned By</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow
                    key={assignment.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">User {assignment.userId}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{assignment.roleId}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm text-muted/60">{assignment.assignedAt}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm text-muted/60">{assignment.assignedBy || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria="View assignment details"
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
    </div>
  )
}