/* Academics - SaintsHub School Portal
 * Provides: Assessments list, filters, create-assessment form
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface Assessment {
  id: string
  title: string
  assessmentType: "FORMATIVE" | "SUMMATIVE" | "SBA"
  grade: string
  subject: string
  term: string
  maxScore: number
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
}

const TYPE_VARIANT: Record<Assessment["assessmentType"], "primary" | "secondary" | "warning"> = {
  FORMATIVE: "primary",
  SUMMATIVE: "secondary",
  SBA: "warning",
}

const STATUS_VARIANT: Record<Assessment["status"], "secondary" | "success" | "destructive"> = {
  DRAFT: "secondary",
  ACTIVE: "success",
  ARCHIVED: "destructive",
}

export function Academics() {
  const [grade, setGrade] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [term, setTerm] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [createType, setCreateType] = useState("FORMATIVE")
  const [createGrade, setCreateGrade] = useState("Grade 7")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchAssessments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/school/assessments", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      setAssessments(body?.data ?? [])
    } catch {
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssessments()
  }, [fetchAssessments])

  const visible = assessments.filter((a) => {
    if (grade && a.grade !== grade) return false
    if (type && a.assessmentType !== type) return false
    if (status && a.status !== status) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!a.title.toLowerCase().includes(q) && !a.subject.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/school/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, term, maxScore: Number(maxScore) || 100, assessmentType: createType, grade: createGrade, status: "DRAFT" }),
      })
      setMessage(res.ok ? "Assessment created." : "Could not create assessment.")
      if (res.ok) {
        setTitle("")
        setSubject("")
        setTerm("")
        fetchAssessments()
      }
    } catch {
      setMessage("Could not create assessment.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Academics</h2>
        <p className="text-sm text-muted-foreground">Assessments, report cards and academic records</p>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{assessments.length} Assessments</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Search title or subject…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="w-full sm:w-56"
              aria-label="Search assessments"
            />
            <Select onValueChange={(e) => setGrade(e.target.value)} defaultValue="" name="grade" aria-label="Filter by grade">
              <SelectTrigger><SelectValue placeholder="All grades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All grades</SelectItem>
                {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setType(e.target.value)} defaultValue="" name="type" aria-label="Filter by type">
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="FORMATIVE">Formative</SelectItem>
                <SelectItem value="SUMMATIVE">Summative</SelectItem>
                <SelectItem value="SBA">SBA</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(e) => setStatus(e.target.value)} defaultValue="" name="status" aria-label="Filter by status">
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead className="text-right">Max Score</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Term</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.subject}</div>
                  </TableCell>
                  <TableCell className="text-right">{a.maxScore}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={TYPE_VARIANT[a.assessmentType] ?? "secondary"} size="sm">{a.assessmentType}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{a.grade}</TableCell>
                  <TableCell className="text-center">{a.term}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[a.status] ?? "secondary"} size="sm">{a.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No assessments found.</p>
          )}
          {loading && <TableSkeleton columns={6} rows={5} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
              <Input id="title" name="title" value={title} onValueChange={setTitle} required />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
              <Input id="subject" name="subject" value={subject} onValueChange={setSubject} placeholder="e.g. Mathematics" required />
            </div>
            <div>
              <label htmlFor="type" className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
              <Select onValueChange={(e) => setCreateType(e.target.value)} defaultValue="FORMATIVE" name="type">
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORMATIVE">Formative</SelectItem>
                  <SelectItem value="SUMMATIVE">Summative</SelectItem>
                  <SelectItem value="SBA">SBA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="grade" className="mb-1 block text-xs font-medium text-muted-foreground">Grade</label>
              <Select onValueChange={(e) => setCreateGrade(e.target.value)} defaultValue="Grade 7" name="grade">
                <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="maxScore" className="mb-1 block text-xs font-medium text-muted-foreground">Max Score</label>
              <Input id="maxScore" name="maxScore" type="number" min={1} value={maxScore} onValueChange={setMaxScore} />
            </div>
            <div>
              <label htmlFor="term" className="mb-1 block text-xs font-medium text-muted-foreground">Term</label>
              <Input id="term" name="term" value={term} onValueChange={setTerm} placeholder="e.g. Term 1" />
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" variant="primary" disabled={saving} loading={saving}>
                {saving ? "Creating…" : "Create Assessment"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
