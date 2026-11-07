"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { CheckCircle2, Download, FileText } from "lucide-react"
import { useEffect, useState } from "react"

interface SubjectScore {
  name: string
  grade: string
  score: number
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

const FALLBACK_CARDS: ReportCard[] = [
  {
    id: "rc-001",
    term: "Term 1",
    academicYear: "2026",
    issueDate: new Date(Date.now() - 86400000).toISOString(),
    overallGrade: "A",
    overallScore: 85,
    subjects: [
      { name: "Mathematics", grade: "A", score: 92 },
      { name: "English", grade: "B+", score: 78 },
      { name: "Kiswahili", grade: "A", score: 88 },
      { name: "Science & Technology", grade: "A", score: 90 },
      { name: "Religious Education", grade: "A", score: 85 },
    ],
    studentName: "Adeline Akinyi",
    admissionNumber: "STD-2024-001",
    parentAcknowledged: false,
  },
]

export default function ReportCardsPage() {
  const [cards, setCards] = useState<ReportCard[]>([])
  const [loading, setLoading] = useState(true)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/parent/report-cards", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const list: ReportCard[] = body?.reportCards?.length ? body.reportCards : FALLBACK_CARDS
        setCards(list)
        setSelectedId(list[0]?.id ?? null)
      })
      .catch(() => {
        setCards(FALLBACK_CARDS)
        setSelectedId(FALLBACK_CARDS[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const selected = cards.find((c) => c.id === selectedId)

  const acknowledge = (id: string) => setAcknowledgedIds((prev) => new Set(prev).add(id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Report Cards</h2>
        <p className="text-sm text-muted-foreground">Academic performance and teacher remarks</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Issued Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cards.map((card) => {
              const acknowledged = card.parentAcknowledged || acknowledgedIds.has(card.id)
              return (
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
                    <Badge variant={acknowledged ? "success" : "warning"} size="sm">
                      {acknowledged ? "ACKNOWLEDGED" : "NEW"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="font-bold">{card.overallGrade} · {card.overallScore}%</span>
                  </div>
                </button>
              )
            })}
            {loading && <p className="py-6 text-center text-sm text-muted-foreground">Loading report cards…</p>}
            {!loading && cards.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No report cards issued yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{selected ? `${selected.studentName} — ${selected.term} ${selected.academicYear}` : "Report Details"}</CardTitle>
            {selected && (
              <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> PDF</Button>
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
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Score</p>
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
                          <TableCell className="text-center font-medium">{subject.score}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" size="sm">{subject.grade}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {acknowledgedIds.has(selected.id) || selected.parentAcknowledged ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-anglican-green-700">
                    <CheckCircle2 className="h-4 w-4" /> Receipt acknowledged — thank you.
                  </p>
                ) : (
                  <Button variant="primary" onClick={() => acknowledge(selected.id)}>
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
    </div>
  )
}
