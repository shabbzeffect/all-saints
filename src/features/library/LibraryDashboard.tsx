/* LibraryDashboard - SaintsHub Library Module
 * Library desk overview: catalog stats, members, active loans and returns.
 * Falls back to a demo catalog when the library service is unreachable.
 */
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, BookCopy, Users, AlarmClock } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/config"

interface Book {
  id: string
  title: string
  author: string
  isbn?: string | null
  category?: string
  copiesTotal?: number
  copiesAvailable?: number
  publicationYear?: number
}

interface Member {
  id: string
  name: string
  type: string
  grade?: string
  membershipStatus?: string
}

interface Loan {
  id: string
  bookTitle?: string
  book?: { title?: string }
  memberName?: string
  student?: { name?: string; fullName?: string }
  dueDate?: string
  status?: string
  fineAmount?: number
}

interface ReturnRecord {
  id: string
  bookTitle?: string
  book?: { title?: string }
  memberName?: string
  student?: { name?: string; fullName?: string }
  returnDate?: string
  returnedAt?: string
  fineAmount?: number
  fineStatus?: string
}

const DEMO_BOOKS: Book[] = [
  { id: "bk-1", title: "Things Fall Apart", author: "Chinua Achebe", isbn: "978-0385474542", category: "FICTION", copiesTotal: 8, copiesAvailable: 5, publicationYear: 1958 },
  { id: "bk-2", title: "The River and the Source", author: "Margaret Ogola", isbn: "978-9966252083", category: "FICTION", copiesTotal: 6, copiesAvailable: 2, publicationYear: 1994 },
  { id: "bk-3", title: "Kenya: The Quest for Democracy", author: "Various", isbn: "978-9966253929", category: "REFERENCE", copiesTotal: 3, copiesAvailable: 3, publicationYear: 2010 },
  { id: "bk-4", title: "Bible (NIV, Study Edition)", author: "Zondervan", isbn: "978-0310927697", category: "REFERENCE", copiesTotal: 12, copiesAvailable: 9, publicationYear: 2002 },
  { id: "bk-5", title: "The Boy Who Harnessed the Wind", author: "William Kamkwamba", isbn: "978-0062300442", category: "BIOGRAPHY", copiesTotal: 5, copiesAvailable: 4, publicationYear: 2009 },
  { id: "bk-6", title: "Blossoms of the Savannah", author: "Henry Ole Kulet", isbn: "978-9966545437", category: "CHILDREN", copiesTotal: 7, copiesAvailable: 6, publicationYear: 2009 },
]

const DEMO_MEMBERS: Member[] = [
  { id: "mem-1", name: "Adeline Akinyi", type: "STUDENT", grade: "Grade 3", membershipStatus: "ACTIVE" },
  { id: "mem-2", name: "Brian Ochieng", type: "STUDENT", grade: "Grade 7", membershipStatus: "ACTIVE" },
  { id: "mem-3", name: "Mary Achieng", type: "TEACHER", membershipStatus: "ACTIVE" },
  { id: "mem-4", name: "John Okoth", type: "TEACHER", membershipStatus: "ACTIVE" },
]

const DEMO_LOANS: Loan[] = [
  { id: "ln-1", bookTitle: "Things Fall Apart", memberName: "Brian Ochieng", dueDate: new Date(Date.now() + 4 * 86400000).toISOString(), status: "ACTIVE" },
  { id: "ln-2", bookTitle: "Bible (NIV, Study Edition)", memberName: "Adeline Akinyi", dueDate: new Date(Date.now() - 2 * 86400000).toISOString(), status: "OVERDUE", fineAmount: 40 },
  { id: "ln-3", bookTitle: "Blossoms of the Savannah", memberName: "Mary Achieng", dueDate: new Date(Date.now() + 9 * 86400000).toISOString(), status: "ACTIVE" },
]

const DEMO_RETURNS: ReturnRecord[] = [
  { id: "rt-1", bookTitle: "The Boy Who Harnessed the Wind", memberName: "Brian Ochieng", returnDate: new Date(Date.now() - 1 * 86400000).toISOString(), fineAmount: 0, fineStatus: "PAID" },
  { id: "rt-2", bookTitle: "Kenya: The Quest for Democracy", memberName: "John Okoth", returnDate: new Date(Date.now() - 3 * 86400000).toISOString(), fineAmount: 60, fineStatus: "UNPAID" },
]

type Tab = "catalog" | "members" | "loans" | "returns"

export function LibraryDashboard() {
  const [tab, setTab] = useState<Tab>("catalog")
  const [search, setSearch] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [returns, setReturns] = useState<ReturnRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [b, m, l, r] = await Promise.all([
        fetch("/api/library/books", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)).catch(() => null),
        fetch("/api/library/members", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)).catch(() => null),
        fetch("/api/library/loans", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)).catch(() => null),
        fetch("/api/library/returns", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)).catch(() => null),
      ])
      setBooks(b?.data?.length ? b.data : DEMO_BOOKS)
      setMembers(m?.data?.length ? m.data : DEMO_MEMBERS)
      setLoans(l?.data?.length ? l.data : DEMO_LOANS)
      setReturns(r?.data?.length ? r.data : DEMO_RETURNS)
      setLoading(false)
    }
    load()
  }, [])

  const totalCopies = books.reduce((sum, b) => sum + (b.copiesTotal ?? 1), 0)
  const availableCopies = books.reduce((sum, b) => sum + (b.copiesAvailable ?? 1), 0)
  const activeLoans = loans.filter((l) => (l.status ?? "ACTIVE") === "ACTIVE" || l.status === "OVERDUE").length
  const overdueLoans = loans.filter((l) => l.status === "OVERDUE" || (l.dueDate && new Date(l.dueDate) < new Date() && l.status !== "RETURNED")).length

  const metrics = [
    { label: "Titles in Catalog", value: books.length, icon: BookOpen },
    { label: "Copies Available", value: `${availableCopies}/${totalCopies}`, icon: BookCopy },
    { label: "Library Members", value: members.length, icon: Users },
    { label: "Overdue Loans", value: overdueLoans, icon: AlarmClock },
  ]

  const loanBook = (l: Loan) => l.bookTitle ?? l.book?.title ?? "Untitled"
  const loanMember = (l: Loan) => l.memberName ?? l.student?.name ?? l.student?.fullName ?? "—"
  const returnBook = (r: ReturnRecord) => r.bookTitle ?? r.book?.title ?? "Untitled"
  const returnMember = (r: ReturnRecord) => r.memberName ?? r.student?.name ?? r.student?.fullName ?? "—"
  const returnDate = (r: ReturnRecord) => r.returnDate ?? r.returnedAt

  const q = search.trim().toLowerCase()
  const visibleBooks = books.filter((b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn ?? "").toLowerCase().includes(q))
  const visibleMembers = members.filter((m) => !q || m.name.toLowerCase().includes(q))
  const visibleLoans = loans.filter((l) => !q || loanBook(l).toLowerCase().includes(q) || loanMember(l).toLowerCase().includes(q))
  const visibleReturns = returns.filter((r) => !q || returnBook(r).toLowerCase().includes(q) || returnMember(r).toLowerCase().includes(q))

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "catalog", label: "Catalog" },
    { id: "members", label: "Members" },
    { id: "loans", label: "Loans" },
    { id: "returns", label: "Returns" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Library Desk</h2>
        <p className="text-sm text-muted-foreground">Catalog, lending and returns</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold">{metric.value}</p>
              </div>
              <div className="rounded-lg bg-anglican-blue-50 p-2 text-anglican-blue-700">
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Library sections" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Input
            type="search"
            placeholder="Search this section…"
            value={search}
            onValueChange={setSearch}
            className="w-full sm:w-56"
            aria-label="Search library"
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {tab === "catalog" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead className="text-center">Category</TableHead>
                  <TableHead className="text-center">Year</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleBooks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium">{b.title}</div>
                      <div className="text-xs text-muted-foreground">{b.author}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{b.isbn ?? "—"}</TableCell>
                    <TableCell className="text-center">{b.category ?? "—"}</TableCell>
                    <TableCell className="text-center">{b.publicationYear ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={(b.copiesAvailable ?? 0) > 0 ? "success" : "destructive"} size="sm">
                        {b.copiesAvailable ?? 0}/{b.copiesTotal ?? 1}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === "members" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Class/Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-center">{m.type}</TableCell>
                    <TableCell className="text-center">{m.grade ?? "Staff"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={m.membershipStatus === "EXPIRED" ? "warning" : m.membershipStatus === "SUSPENDED" ? "destructive" : "success"} size="sm">
                        {m.membershipStatus ?? "ACTIVE"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === "loans" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead className="text-center">Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLoans.map((l) => {
                  const overdue = l.dueDate ? new Date(l.dueDate) < new Date() : false
                  const status = l.status ?? (overdue ? "OVERDUE" : "ACTIVE")
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{loanBook(l)}</TableCell>
                      <TableCell>{loanMember(l)}</TableCell>
                      <TableCell className="text-center">{l.dueDate ? new Date(l.dueDate).toLocaleDateString("en-KE") : "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status === "OVERDUE" ? "destructive" : "success"} size="sm">{status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{l.fineAmount ? `KES ${l.fineAmount}` : "—"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {tab === "returns" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Returned By</TableHead>
                  <TableHead className="text-center">Return Date</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                  <TableHead className="text-center">Fine Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleReturns.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{returnBook(r)}</TableCell>
                    <TableCell>{returnMember(r)}</TableCell>
                    <TableCell className="text-center">{returnDate(r) ? new Date(returnDate(r) as string).toLocaleDateString("en-KE") : "—"}</TableCell>
                    <TableCell className="text-right">{r.fineAmount ? `KES ${r.fineAmount}` : "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={r.fineStatus === "UNPAID" ? "warning" : "success"} size="sm">{r.fineStatus ?? "PAID"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading library…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
