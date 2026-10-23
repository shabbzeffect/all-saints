/* MembersPage.tsx
 * Parish - Members page
 * Provides: Member list, search, roles, actions
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  role: "priest" | "treasurer" | "secretary" | "lay"
  status: "active" | "inactive"
  dateJoined: string
  wing: "PARISH"
}

interface MembersFilter {
  role?: "priest" | "treasurer" | "secretary" | "lay"
  status?: "active" | "inactive"
  searchTerm?: string
}

export function MembersPage() {
  const [filter, setFilter] = useState<MembersFilter>({})
  const [searchTerm, setSearchTerm] = useState("")

  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    fetch(`/api/parish/members${searchTerm ? `?search=${searchTerm}` : ""}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []))
      .catch((err) => console.error("Failed to fetch members:", err))
  }, [searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setFilter({ ...filter, searchTerm: e.target.value })
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, role: e.target.value as "priest" | "treasurer" | "secretary" | "lay" })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, status: e.target.value as "active" | "inactive" })
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
            <Input
              placeholder="Search members..."
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
                <SelectItem value="priest">Priest</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="lay">Lay</SelectItem>
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
                <TableClassName>Member</TableClassName>
                <TableCell className="w-32">Name</TableCell>
                <TableCell className="text-right">Email</TableCell>
                <TableCell className="text-right">Phone</TableCell>
                <TableCell className="text-center">Role</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell className="text-right">Joined</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow
                  key={member.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="text-right">{member.phone}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={member.role === "priest" ? "default" : member.role === "treasurer" ? "secondary" : member.role === "secretary" ? "destructive" : "primary"}
                      size="sm"
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={member.status === "active" ? "default" : "secondary"}
                      size="sm"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{member.dateJoined}</div>
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

          {members.length === 0 && (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No members found. Add members first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

MembersPage.displayName = "MembersPage"