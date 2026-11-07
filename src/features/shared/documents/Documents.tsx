/* Documents - SaintsHub Admin
 * Institutional document library with type and wing filters
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { useState, useEffect } from "react"

interface DocumentRow {
  id: string
  name: string
  type: "SYLLABUS" | "TEXTBOOK" | "REFERENCE" | "PERMISSION_FORM" | "REPORT_CARD" | "OTHER"
  description?: string
  uploader: string
  uploadedAt: string
  fileSize?: number
  downloadCount: number
  wing: "SCHOOL" | "PARISH"
}

const TYPE_VARIANT: Record<DocumentRow["type"], "primary" | "info" | "warning" | "secondary"> = {
  SYLLABUS: "primary",
  TEXTBOOK: "info",
  REFERENCE: "secondary",
  PERMISSION_FORM: "warning",
  REPORT_CARD: "warning",
  OTHER: "secondary",
}

const formatSize = (bytes?: number) => {
  if (!bytes) return "—"
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1000)} KB`
}

export function Documents() {
  const [wing, setWing] = useState("SCHOOL")
  const [type, setType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ wing })
    if (type) params.set("type", type)
    if (searchTerm) params.set("search", searchTerm)
    fetch(`/api/shared/documents?${params}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setDocuments(body?.data ?? []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [wing, type, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Documents</h2>
        <p className="text-sm text-muted-foreground">Shared files across the school and parish wings</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{documents.length} Documents</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search documents…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search documents"
            />
            <Select onValueChange={(e) => setWing(e.target.value)} defaultValue="SCHOOL" name="wing" aria-label="Filter by wing">
              <SelectTrigger><SelectValue placeholder="Wing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHOOL">School</SelectItem>
                <SelectItem value="PARISH">Parish</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setType(e.target.value)} defaultValue="" name="type" aria-label="Filter by type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="SYLLABUS">Syllabus</SelectItem>
                <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                <SelectItem value="REFERENCE">Reference</SelectItem>
                <SelectItem value="PERMISSION_FORM">Permission Form</SelectItem>
                <SelectItem value="REPORT_CARD">Report Card</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead className="text-center">Size</TableHead>
                <TableHead className="text-center">Downloads</TableHead>
                <TableHead className="text-center">Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        {doc.description && <div className="line-clamp-1 text-xs text-muted-foreground">{doc.description}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={TYPE_VARIANT[doc.type] ?? "secondary"} size="sm">{doc.type.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{doc.uploader}</TableCell>
                  <TableCell className="text-center text-sm">{formatSize(doc.fileSize)}</TableCell>
                  <TableCell className="text-center">{doc.downloadCount}</TableCell>
                  <TableCell className="text-center text-sm">{new Date(doc.uploadedAt).toLocaleDateString("en-KE")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" aria-label="Download document">
                      <Download className="mr-1 h-4 w-4" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && documents.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No documents found.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading documents…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
