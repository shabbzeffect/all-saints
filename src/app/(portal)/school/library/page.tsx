/* School Library - SaintsHub School Portal
Provides: Book catalog, member management, loan tracking
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: "FICTION" | "NON_FICTION" | "REFERENCE" | "BIOGRAPHY" | "CHILDREN"
  publisher: string
  publishedYear: number
  totalCopies: number
  availableCopies: number
  language: string
  description: string
  location: "SHELVES" | "STORAGE" | "PROCESSING"
  condition: "NEW" | "GOOD" | "FAIR" | "POOR"
}

interface Member {
  id: string
  name: string
  admissionNumber: string
  grade: string
  type: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  email: string
  phone: string
  dateJoined: string
  membershipStatus: "ACTIVE" | "EXPIRED" | "SUSPENDED"
  booksBorrowed: number
  maxBooks: number
  finesOutstanding: number
}

interface Loan {
  id: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  memberType: "STUDENT" | "TEACHER" | "STAFF" | "PARENT"
  borrowedDate: string
  dueDate: string
  status: "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST"
  fineAmount: number
}

export function SchoolLibrary() {
  const [searchParams] = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const router = useRouter()

  // Initialize from URL filters
  useEffect(() => {
    const status = searchParams.get("status") || ""
    const category = searchParams.get("category") || ""
    setFilters({ status, category, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    searchTerm: "",
  })

  const fetchBooks = useCallback(async () => {
    const response = await fetch("/api/library/books${searchParams.toString() ? `?${searchParams.toString()` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setBooks(data.data || [])
  }, [searchParams])

  const fetchMembers = useCallback(async () => {
    const response = await fetch("/api/library/members", { cache: "no-store" })
    const data = await response.json()
    setMembers(data.data || [])
  }, [])

  const fetchLoans = useCallback(async () => {
    const response = await fetch("/api/library/loans${searchParams.toString() ? `?${searchParams.toString()` : ""}", {
      cache: "no-store",
    })
    const data = await response.json()
    setLoans(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchBooks()
    fetchMembers()
    fetchLoans()
  }, [fetchBooks, fetchMembers, fetchLoans])

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

  const filteredBooks = books.filter((book) => {
    const matchesCategory = filters.category
      ? book.category === filters.category
      : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const filteredMembers = members.filter((member) => {
    const matchesType = filters.type ? member.type === filters.type : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : member.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        member.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesType && matchesSearch
  })

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : loan.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        loan.memberName.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          School Library
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Book catalog, members & loan management
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
              <label className="text-sm text-muted/60 mb-1">Category</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="category"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="FICTION">Fiction</SelectItem>
                  <SelectItem value="NON_FICTION">Non-Fiction</SelectItem>
                  <SelectItem value="REFERENCE">Reference</SelectItem>
                  <SelectItem value="BIOGRAPHY">Biography</SelectItem>
                  <SelectItem value="CHILDREN">Children</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Member Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All member types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
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
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by title, author, or member name..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Book Catalog {filteredBooks.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBooks.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No books found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell className="text-center">Author</TableCell>
                  <TableCell className="text-center">Category</TableCell>
                  <TableCell className="text-right">Copies</TableCell>
                  <TableCell className="text-center">Available</TableCell>
                  <TableCell className="text-center">Location</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow
                    key={book.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>{book.title}</TableCell>
                    <TableCell className="text-center">{book.author}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={book.category === "FICTION" ? "default" : book.category === "NON_FICTION" ? "secondary" : book.category === "REFERENCE" ? "destructive" : book.category === "BIOGRAPHY" ? "primary" : "info"} size="sm">
                        {book.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{book.totalCopies}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" size="sm">
                        {book.availableCopies}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={book.location === "SHELVES" ? "default" : book.location === "STORAGE" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {book.location}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View book details"
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

      {/* Members Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Library Members {filteredMembers.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No members found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Grade</TableCell>
                  <TableCell className="text-center">Books</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted/60">{member.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={member.type === "STUDENT" ? "default" : member.type === "TEACHER" ? "secondary" : member.type === "STAFF" ? "destructive" : "primary"}
                        size="sm"
                      >
                        {member.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{member.grade}</TableCell>
                    <TableCell className="text-center">
                      <div>{member.booksBorrowed}/{member.maxBooks}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={member.membershipStatus === "ACTIVE" ? "default" : member.membershipStatus === "EXPIRED" ? "destructive" : "secondary"}
                        size="sm"
                      >
                        {member.membershipStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View member details"
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

      {/* Active Loans Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Active Loans {loans.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No active loans.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell className="text-center">Book</TableCell>
                  <TableCell className="text-center">Borrowed</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Fine</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow
                    key={loan.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{loan.memberName}</div>
                      <div className="text-xs text-muted/60">{loan.memberType}</div>
                    </TableCell>
                    <TableCell className="text-center">{loan.bookTitle}</TableCell>
                    <TableCell className="text-center">
                      <div>{loan.borrowedDate}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={loan.status === "ACTIVE" ? "default" : loan.status === "OVERDUE" ? "destructive" : "secondary"}
                        size="sm"
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {loan.fineAmount > 0 ? (
                        <Badge variant="destructive" size="sm">
                          KSh {loan.fineAmount}
                        </Badge>
                      ) : (
                        <div className="text-sm text-muted/60">—</div>
                      )}
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