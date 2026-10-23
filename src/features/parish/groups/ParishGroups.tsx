/* Parish Groups - SaintsHub Parish Portal
Provides: Cell groups, Bible studies, fellowship management
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface ParishGroup {
  id: string
  name: string
  description: string
  type: "CELL" | "BIBLE_STUDY" | "PRAYER" | "OUTREACH" | "SOCIAL" | "OTHER"
  leaderName: string
  leaderPhone: string
  memberCount: number
  capacity: number
  meetingSchedule: string
  location: string
  status: "ACTIVE" | "INACTIVE" | "DORMANT"
  wing: "PARISH"
  createdAt: string
}

interface GroupFilter {
  type?: "CELL" | "BIBLE_STUDY" | "PRAYER" | "OUTREACH" | "SOCIAL" | "OTHER"
  status?: "ACTIVE" | "INACTIVE" | "DORMANT"
  searchTerm?: string
}

export function ParishGroups() {
  const [filters, setFilters] = useState<GroupFilter>({
    type: "",
    status: "",
    searchTerm: "",
  })
  const [groups, setGroups] = useState<ParishGroup[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    setFilters({ type, status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchGroups = useCallback(async () => {
    const response = await fetch(`/api/parish/groups${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setGroups(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const filteredGroups = groups.filter((group) => {
    const matchesType = filters.type ? group.type === filters.type : true
    const matchesStatus = filters.status ? group.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : group.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
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
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-purple dark:text-anglican-purple-100">
          Parish Groups
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Cell groups, Bible studies & fellowships
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
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="CELL">Cell Group</SelectItem>
                  <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                  <SelectItem value="PRAYER">Prayer</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
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
                  <SelectItem value="DORMANT">Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by name or description..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>{groups.length} Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No groups found. Create a group first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Group</TableClassName>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Members</TableCell>
                  <TableCell className="text-center">Capacity</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow
                    key={group.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-muted/60">{group.wing} wing</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="default"
                        size="sm"
                      >
                        {group.memberCount}/{group.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={group.status === "ACTIVE" ? "default" : group.status === "INACTIVE" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{group.meetingSchedule}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria-label="View group details"
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

      {/* Create Group Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Group Name</label>
              <Input name="name" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select defaultValue="CELL" name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CELL">Cell Group</SelectItem>
                  <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                  <SelectItem value="PRAYER">Prayer</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Description</label>
              <Input name="description" className="w-full" placeholder="Brief description" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Leader Name</label>
              <Input name="leaderName" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Leader Phone</label>
              <Input
                type="tel"
                name="leaderPhone"
                placeholder="+254712345678"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Capacity</label>
              <Input
                type="number"
                name="capacity"
                min="1"
                value="15"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Meeting Schedule</label>
              <Input
                placeholder="e.g., Wednesdays, 7:00 PM"
                name="meetingSchedule"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Location</label>
              <Input name="location" className="w-full" />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Create Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}