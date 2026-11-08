/* AdmissionsPage.tsx
 * School - Admissions pipeline: applicant list, search and status filter
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import Link from "next/link"
import { UserPlus } from "lucide-react"

interface Applicant {
  id: string
  fullName: string
  email: string
  phone: string
  currentSchool: string
  grade: string
  status: "pending" | "accepted" | "rejected" | "enrolled"
  dateCreated?: string
}

const STATUS_VARIANT: Record<Applicant["status"], "warning" | "primary" | "destructive" | "success"> = {
  pending: "warning",
  accepted: "primary",
  rejected: "destructive",
  enrolled: "success",
}

export function AdmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("")
  const [grade, setGrade] = useState("")
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/school/admissions${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { applicants: [] }))
      .then((data) => setApplicants(data.applicants ?? data.data ?? []))
      .catch(() => setApplicants([]))
      .finally(() => setLoading(false))
  }, [searchTerm])

  const visible = applicants.filter((a) => {
    if (status && a.status !== status) return false
    if (grade && a.grade !== grade) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Admissions</h2>
        <p className="text-sm text-muted-foreground">Applicant pipeline and enrollment decisions</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Applicants</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search applicants…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search applicants"
            />
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setGrade(e.target.value)} defaultValue="" name="grade" aria-label="Filter by grade">
              <SelectTrigger><SelectValue placeholder="All grades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All grades</SelectItem>
                {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Current School</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell className="font-medium">{applicant.fullName}</TableCell>
                  <TableCell>
                    <div className="text-sm">{applicant.email}</div>
                    <div className="text-xs text-muted-foreground">{applicant.phone}</div>
                  </TableCell>
                  <TableCell>{applicant.currentSchool}</TableCell>
                  <TableCell className="text-center">{applicant.grade}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[applicant.status] ?? "secondary"} size="sm">
                      {applicant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <div className="flex flex-col items-center py-8"><UserPlus className="h-6 w-6 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" /><p className="mt-2 text-sm font-medium text-muted-foreground">No applicants yet</p><Link href="/admissions/apply" className="mt-1 text-xs font-semibold text-anglican-blue-700 hover:underline">Families can apply online � share the link</Link></div>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading applicants…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
