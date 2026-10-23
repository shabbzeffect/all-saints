/* Shared Documents - SaintsHub Platform
Provides: Document library and uploads for all wings
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Document {
  id: string
  name: string
  type: "SYLLABUS" | "TEXTBOOK" | "REFERENCE" | "PERMISSION_FORM" | "REPORT_CARD" | "OTHER"
  description: string
  uploader: string
  uploadedAt: string
  fileUrl: string
  fileSize: number
  downloadCount: number
  wing: "SCHOOL" | "PARISH"
  applicableGrades: string[]
}

interface DocumentFilter {
  type?: "SYLLABUS" | "TEXTBOOK" | "REFERENCE" | "PERMISSION_FORM" | "REPORT_CARD" | "OTHER"
  wing?: "SCHOOL" | "PARISH"
  searchTerm?: string
}

export function Documents() {
  const [filters, setFilters] = useState<DocumentFilter>({
    type: "",
    wing: "SCHOOL",
    searchTerm: "",
  })
  const [documents, setDocuments] = useState<Document[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const type = searchParams.get("type") || ""
    setFilters({ type, wing, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchDocuments = useCallback(async () => {
    const response = await fetch(`/api/shared/documents${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setDocuments(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const filteredDocuments = documents.filter((document) => {
    const matchesType = filters.type ? document.type === filters.type : true
    const matchesWing = filters.wing ? document.wing === filters.wing : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : document.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          document.description.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesType && matchesWing && matchesSearch
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
          Documents
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Document library and resources
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
                  <SelectItem value="SYLLABUS">Syllabus</SelectItem>
                  <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                  <SelectItem value="REFERENCE">Reference</SelectItem>
                  <SelectItem value="PERMISSION_FORM">Permission Form</SelectItem>
                  <SelectItem value="REPORT_CARD">Report Card</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Wing</label>
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

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>{documents.length} Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No documents found. Upload a document first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Document</TableClassName>
                  <TableCell className="text-right">Size</TableCell>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Wing</TableCell>
                  <TableCell className="text-center">Grades</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow
                    key={document.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{document.name}</div>
                      <div className="text-xs text-muted/60">{document.wing} wing</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        {document.fileSize > 1024 * 1024
                          ? (document.fileSize / (1024 * 1024)).toFixed(1) + " MB"
                          : (document.fileSize / 1024).toFixed(1) + " KB"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={document.type === "SYLLABUS" ? "default" : document.type === "TEXTBOOK" ? "secondary" : document.type === "REFERENCE" ? "default" : document.type === "PERMISSION_FORM" ? "secondary" : "default"}
                        size="sm"
                      >
                        {document.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={document.wing === "SCHOOL" ? "default" : "secondary"}
                        size="sm"
                      >
                        {document.wing}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {document.applicableGrades.length > 0
                          ? document.applicableGrades.join(", ")
                          : "All"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria="View document"
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

      {/* Upload Document Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Name</label>
              <Input name="name" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select defaultValue="SYLLABUS" name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYLLABUS">Syllabus</SelectItem>
                  <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                  <SelectItem value="REFERENCE">Reference</SelectItem>
                  <SelectItem value="PERMISSION_FORM">Permission Form</SelectItem>
                  <SelectItem value="REPORT_CARD">Report Card</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Wing</label>
              <Select defaultValue="SCHOOL" name="wing">
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
              <label className="text-sm text-muted/60 mb-1">Description</label>
              <Input name="description" className="w-full" placeholder="Brief description" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Applicable Grades</label>
              <Input
                placeholder="e.g., Grade 1, Grade 2, Grade 3"
                name="applicableGrades"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">File URL</label>
              <Input
                placeholder="/documents/syllabus-grade-1.pdf"
                name="fileUrl"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">File Size (bytes)</label>
              <Input
                type="number"
                name="fileSize"
                min="1"
                value="102400"
                className="w-full"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Upload Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}