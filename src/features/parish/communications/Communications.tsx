/* Parish Communications - SaintsHub Parish Portal
Provides: Announcements, events, news for parish members
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Communication {
  id: string
  title: string
  type: "ANNOUNCEMENT" | "EVENT" | "NEWS"
  content: string
  author: string
  publishedAt: string
  wing: "SCHOOL" | "PARISH"
  targetAudience: "ALL" | "PARENTS" | "STAFF" | "STUDENTS" | "MEMBERS"
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}

interface CommunicationsProps {
  communications: Communication[]
  onNavigate: (path: string) => void
}

export function Communications({ communications, onNavigate }: CommunicationsProps) {
  const [filters, setFilters] = useState<{
    wing: "SCHOOL" | "PARISH"
    type: "ANNOUNCEMENT" | "EVENT" | "NEWS" | ""
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | ""
    searchTerm: string
  }>({
    wing: "SCHOOL",
    type: "",
    status: "",
    searchTerm: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL
  useEffect(() => {
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    setFilters({ wing, type, status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const filteredCommunications = communications.filter((comm) => {
    const matchesWing = filters.wing ? comm.wing === filters.wing : true
    const matchesType = filters.type ? comm.type === filters.type : true
    const matchesStatus = filters.status ? comm.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : comm.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          comm.content.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesWing && matchesType && matchesStatus && matchesSearch
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
      setSearchTerm(value)
      setFilters((prev) => ({ ...prev, searchTerm: value }))
    },
    []
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-purple dark:text-anglican-purple-100">
          Parish Communications
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Announcements, events & news for the SaintsHub parish community
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
              <label className="text-xs text-muted/60 uppercase tracking-wider mb-1">Wing</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue="SCHOOL"
                name="wing"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select wing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHOOL">School</SelectItem>
                  <SelectItem value="PARISH">Parish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted/60 uppercase tracking-wider mb-1">Type</label>
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
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="NEWS">News</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted/60 uppercase tracking-wider mb-1">Status</label>
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted/60 uppercase tracking-wider mb-1">Search</label>
              <Input
                placeholder="Search title or content..."
                onValueChange={handleSearchChange}
                value={searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>{communications.length} Communications</CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No communications found. Add communications first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Wing</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-right">Published</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow
                    key={comm.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{comm.title}</div>
                      <div className="text-xs text-muted/60">{comm.wing} wing</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={comm.type === "ANNOUNCEMENT" ? "default" : comm.type === "EVENT" ? "secondary" : "secondary"}
                        size="sm"
                      >
                        {comm.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          comm.status === "PUBLISHED"
                            ? "default"
                            : comm.status === "DRAFT"
                              ? "secondary"
                              : "destructive"
                        }
                        size="sm"
                      >
                        {comm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        {new Date(comm.publishedAt).toLocaleDateString("en-KE")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria-label="View communication"
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