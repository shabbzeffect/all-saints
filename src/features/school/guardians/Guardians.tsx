/* School Guardians - SaintsHub School Portal
Provides: Guardian/staff management and contact directory
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Guardian {
  id: string
  name: string
  phone: string
  email: string
  role: "TEACHER" | "ADMIN" | "BURSAR" | "COUNSELOR" | "OTHER"
  wing: "SCHOOL"
  employmentType: "PERMANENT" | "CONTRACT" | "DAILY"
  dateOfJoining: string
  status: "ACTIVE" | "INACTIVE" | "TRANSFERRED"
  notes?: string
}

interface GuardianFilter {
  role?: "TEACHER" | "ADMIN" | "BURSAR" | "COUNSELOR" | "OTHER"
  status?: "ACTIVE" | "INACTIVE" | "TRANSFERRED"
  employmentType?: "PERMANENT" | "CONTRACT" | "DAILY"
  searchTerm?: string
}

export function Guardians() {
  const [filters, setFilters] = useState<GuardianFilter>({
    role: "",
    status: "",
    employmentType: "",
    searchTerm: "",
  })
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""
    const employmentType = searchParams.get("employmentType") || ""
    setFilters({ role, status, employmentType, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchGuardians = useCallback(async () => {
    const response = await fetch(`/api/school/guardians${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setGuardians(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchGuardians()
  }, [fetchGuardians])

  const filteredGuardians = guardians.filter((guardian) => {
    const matchesRole = filters.role ? guardian.role === filters.role : true
    const matchesStatus = filters.status ? guardian.status === filters.status : true
    const matchesEmployment = filters.employmentType
      ? guardian.employmentType === filters.employmentType
      : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : guardian.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          guardian.email.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesRole && matchesStatus && matchesEmployment && matchesSearch
  })

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value
      setFilters((prev) => ({
        ...prev,
        [e.target.name]: value,
      }))
    },
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, searchTerm: value }))
    },
    []
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Guardians
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          School staff & administrator directory
        </p>
      </header>

      {/* Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-sm text-muted/60 mb-1">Role</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="role"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="BURSAR">Bursar</SelectItem>
                  <SelectItem value="COUNSELOR">Counselor</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Status</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="status"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Employment Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="employmentType"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PERMANENT">Permanent</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by name or email..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardians Table */}
      <Card>
        <CardHeader>
          <CardTitle>{guardians.length} Guardians</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGuardians.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No guardians found. Add staff first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Staff</TableClassName>
                  <TableCell className="text-center">Role</TableCell>
                  <TableCell className="text-center">Employment</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-right">Joined</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuardians.map((guardian) => (
                  <TableRow
                    key={guardian.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{guardian.name}</div>
                      <div className="text-xs text-muted/60">{guardian.role}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={guardian.employmentType === "PERMANENT" ? "default" : guardian.employmentType === "CONTRACT" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {guardian.employmentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={guardian.status === "ACTIVE" ? "default" : guardian.status === "INACTIVE" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {guardian.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">{new Date(guardian.dateOfJoining).toLocaleDateString("en-KE")}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View staff details"
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

      {/* Add Guardian Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add Guardian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Name</label>
              <Input name="name" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Phone</label>
              <Input
                type="tel"
                name="phone"
                placeholder="+254712345678"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="staff@saintshub.ke"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Role</label>
              <Select defaultValue="TEACHER" name="role">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="BURSAR">Bursar</SelectItem>
                  <SelectItem value="COUNSELOR">Counselor</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Employment Type</label>
              <Select defaultValue="PERMANENT" name="employmentType">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMANENT">Permanent</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Date of Joining</label>
              <Input
                type="date"
                name="dateOfJoining"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Notes</label>
              <Input name="notes" className="w-full" placeholder="Optional notes" />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Add Guardian
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}