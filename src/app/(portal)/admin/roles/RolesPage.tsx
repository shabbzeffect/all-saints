/* RolesPage.tsx
 * Admin - Roles management page
 * Provides: Role list, permission assignment, role creation
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Permission {
  key: string
  name: string
  category: "academics" | "finance" | "hr" | "library" | "parent" | "parish" | "transport"
}

interface Role {
  id: string
  name: string
  key: string
  permissions: Permission[]
  isSystem: boolean
}

interface RoleForm {
  name: string
  key: string
  permissionKeys: string[]
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [form, setForm] = useState<RoleForm>({
    name: "",
    key: "",
    permissionKeys: [],
  })

  const [permissions] = useState<Permission[]>([
    { key: "users.view", name: "View Users", category: "hr" },
    { key: "users.create", name: "Create User", category: "hr" },
    { key: "users.edit", name: "Edit User", category: "hr" },
    { key: "users.delete", name: "Delete User", category: "hr" },
    { key: "finance.view", name: "View Finance", category: "finance" },
    { key: "finance.create", name: "Create Payment", category: "finance" },
    { key: "finance.edit", name: "Edit Fee Structure", category: "finance" },
    { key: "academics.view", name: "View Academics", category: "academics" },
    { key: "academics.create", name: "Create Assessment", category: "academics" },
    { key: "library.view", name: "View Library", category: "library" },
    { key: "parent.view", name: "View Parent Portal", category: "parent" },
    { key: "parish.view", name: "View Parish", category: "parish" },
    { key: "transport.view", name: "View Transport", category: "transport" },
  ])

  useEffect(() => {
    fetch(`/api/admin/roles`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setRoles(data.roles || []))
      .catch((err) => console.error("Failed to fetch roles:", err))
  }, [])

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setForm((prev) => ({
      ...prev,
      permissionKeys: checked
        ? [...new Set([...prev.permissionKeys, name])]
        : prev.permissionKeys.filter((k) => k !== name),
    }))
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="font-semibold text-anglican-blue dark:text-anglican-blue-100 mb-3">
              Create New Role
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                name="name"
                placeholder="Role name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full"
              />

              <Input
                name="key"
                placeholder="Role key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                className="w-full"
              />

              <Select
                multiple
                onValueChange={handlePermissionChange}
                defaultValue=""
                name="permissions"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map((perm) => (
                    <SelectItem
                      key={perm.key}
                      value={perm.key}
                      name={perm.key}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={form.permissionKeys.includes(perm.key)}
                        onChange={handlePermissionChange}
                        name={perm.key}
                        className="w-4 h-4 rounded border"
                      />
                      <span>{perm.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!form.name || !form.key}
              className="mt-3 w-full">
              Create Role
            </Button>
          </div>

          {/* Roles Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Existing Roles {roles.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableClassName>Role</TableClassName>
                    <TableCell>Permissions</TableCell>
                    <TableCell className="text-center">System</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow
                      key={role.id}
                      className="hover:bg-angle/5 dark:hover:bg-angle/80"
                    >
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        {role.permissions.map((perm) => (
                          <span
                            key={perm.key}
                            className={
                              "inline-flex items-center rounded-xs px-2 py-0.5 text-xs border border-border-dark/30 dark:border-border-dark/10"
                            }
                          >
                            {perm.name}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="text-center">
                        {role.isSystem ? "Yes" : "No"}
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

              {roles.length === 0 && (
                <p className="text-center text-muted dark:text-muted-foreground py-8">
                  No roles found. Create a role first.
                </p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

RolesPage.displayName = "RolesPage"