"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { CheckCircle2, Printer, FileText, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { TableSkeleton } from "@/components/ui/skeleton"

interface SubjectScore {
  name: string
  score: number
  maxScore: number
  grade: string
}

interface ReportCard {
  id: string
  term: string
  academicYear: string
  issueDate: string
  overallGrade: string
  overallScore: number
  subjects: SubjectScore[]
  studentName: string
  admissionNumber: string
  parentAcknowledged: boolean
}

export default function ReportCardsPage() {
  const [cards, setCards] = useState<ReportCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/parent/report-cards", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.success) throw new Error(body?.error ?? "Request failed")
      const list: ReportCard[] = body.data?.reportCards ?? []
      setCards(list)
      setSelectedId((prev) => prev ?? list[0]?.id ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load report cards")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selected = cards.find((c) => c.id === selectedId)

  const acknowledge = async () => {
    if (!selected || selected.parentAcknowledged) return
    setAcknowledging(true)
    try {
      const res = await fetch("/api/parent/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportCardId: selected.id }),
      })
      const body = await res.json().catch(() => null)
      if (res.ok && body?.success) {
        setCards((prev) => prev.map((c) => (c.id === selected.id ? { ...c, parentAcknowledged: true } : c)))
      }
    } finally {
      setAcknowledging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Report Cards</h2>
        <p className="text-sm text-muted-foreground">Academic performance and teacher remarks</p>
      </div>

      {loading && <TableSkeleton columns={3} rows={4} />}

      {!loading && error && (
        <Card className="p-6 text-center">
          <p className="font-medium text-destructive">Could not load report cards</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Issued Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedId(card.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedId === card.id
                      ? "border-anglican-blue-500 bg-anglican-blue-50/50"
                      : "border-border hover:border-anglican-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{card.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.term} {card.academicYear} · issued {new Date(card.issueDate).toLocaleDateString("en-KE")}
                      </p>
                    </div>
                    <Badge variant={card.parentAcknowledged ? "success" : "warning"} size="sm">
                      {card.parentAcknowledged ? "ACKNOWLEDGED" : "NEW"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="font-bold">{card.overallGrade} · {card.overallScore}%</span>
                  </div>
                </button>
              ))}
              {cards.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No report cards issued yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{selected ? `${selected.studentName} — ${selected.term} ${selected.academicYear}` : "Report Details"}</CardTitle>
              {selected && (
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print</Button>
              )}
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Grade</p>
                      <p className="text-3xl font-bold">{selected.overallGrade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Average</p>
                      <p className="text-3xl font-bold">{selected.overallScore}%</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.subjects.map((subject) => (
                          <TableRow key={subject.name}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell className="text-center font-medium">{subject.score}/{subject.maxScore}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" size="sm">{subject.grade}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {selected.subjects.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No subject scores recorded for this term yet.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {selected.parentAcknowledged ? (
                    <p className="flex items-center gap-2 text-sm font-medium text-anglican-green-700">
                      <CheckCircle2 className="h-4 w-4" /> Receipt acknowledged — thank you.
                    </p>
                  ) : (
                    <Button variant="primary" loading={acknowledging} disabled={acknowledging} onClick={acknowledge}>
                      Acknowledge Receipt of Report
                    </Button>
                  )}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">Select a report on the left.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
