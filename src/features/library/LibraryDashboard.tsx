/* Library Dashboard - SaintsHub Library Module
Provides: Book management, member management, loan tracking, return records
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

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

interface ReturnRecord {
  id: string
  loanId: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  borrowedDate: string
  dueDate: string
  returnDate: string
  fineAmount: number
  fineStatus: "PAID" | "UNPAID" | "WAIVED"
  processedBy: string
  processedAt: string
}

interface LibraryStats {
  totalBooks: number
  totalMembers: number
  activeLoans: number
  overdueItems: number
  totalReturns: number
  returnedFineTotal: number
}

interface ReturnFilters {
  fineStatus?: "PAID" | "UNPAID" | "WAIVED"
  searchTerm?: string
}

  // Fetch all data
  const fetchData = useCallback(async () => {
    // Fetch books
    const bookResponse = await fetch("/api/library/books", { cache: "no-store" })
    const bookData = await bookResponse.json()
    setBooks(bookData.data || [])

    // Fetch members
    const memberResponse = await fetch("/api/library/members", { cache: "no-store" })
    const memberData = await memberResponse.json()
    setMembers(memberData.data || [])

    // Fetch loans
    const loanResponse = await fetch("/api/library/loans", { cache: "no-store" })
    const loanData = await loanResponse.json()
    setLoans(loanData.data || [])

    // Fetch returns
    const returnResponse = await fetch("/api/library/returns", { cache: "no-store" })
    const returnData = await returnResponse.json()
    setReturns(returnData.data || [])
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate stats
  useEffect(() => {
    const totalBooks = books.length
    const totalMembers = members.length
    const activeLoans = loans.filter((l) => l.status === "ACTIVE").length
    const overdueItems = loans.filter((l) => l.status === "OVERDUE").length
    const totalReturns = returns.length
    const returnedFineTotal = returns
      .filter((r) => r.fineStatus === "PAID")
      .reduce((sum, r) => sum + r.fineAmount, 0)

    setStats({
      totalBooks,
      totalMembers,
      activeLoans,
      overdueItems,
      totalReturns,
      returnedFineTotal,
    })
  }, [books, loans, returns])

  // Summary cards
  const totalBookValue = books.reduce((sum, book) => sum + book.totalCopies, 0)

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Library Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Library management, books & member loans
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 rounded-lg border border-border-dark/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Total Books</p>
              <p className="font-bold text-2xl">{stats.totalBooks}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Available</p>
              <p className="font-bold text-2xl text-success">
                {books.reduce((sum, b) => sum + b.availableCopies, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-lg border border-border-dark/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Total Members</p>
              <p className="font-bold text-2xl">{stats.totalMembers}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Active Loans</p>
              <p className="font-bold text-2xl text-success">
                {stats.activeLoans}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-lg border border-border-dark/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Overdue Items</p>
              <p className="font-bold text-2xl text-destructive">
                {stats.overdueItems}
              </p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Total Copies</p>
              <p className="font-bold text-2xl"> {totalBookValue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Books Section */}
      <Card>
        <CardHeader>
          <CardTitle>Books {books.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell className="text-center">Author</TableCell>
                <TableCell className="text-center">Category</TableCell>
                <TableCell className="text-right">Copies</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
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
                    <Badge
                      variant={book.availableCopies > 0 ? "default" : "destructive"}
                      size="sm"
                    >
                      {book.availableCopies} avail
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
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Members {members.length}</CardTitle>
        </CardHeader>
        <CardContent>
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
              {members.map((member) => (
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
        </CardContent>
      </Card>

      {/* Active Loans Section */}
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

      {/* Overdue Items Summary */}
      {stats.overdueItems > 0 && (
        <Card className="mt-4 p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <h3 className="text-anglican-blue font-medium mb-3">
            Overdue Items Requiring Attention
          </h3>
          <p className="text-destructive font-medium">
            {stats.overdueItems} item(s) are overdue with outstanding fines totaling KSh {
              loans
                .filter((l) => l.status === "OVERDUE")
                .reduce((sum, l) => sum + l.fineAmount, 0)
                .toLocaleString()
            }
          </p>
          <Button
            variant="link"
            className="text-anglican-blue/60 hover:text-anglican-blue mt-3"
            size="sm"
          >
            View Overdue Details
          </Button>
        </Card>
      )}

      {/* Returns Section */}
      {stats.totalReturns > 0 && (
        <Card className="mt-4 p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <h3 className="text-anglican-blue font-medium mb-3">
            Return Records {stats.totalReturns}
          </h3>
          <p className="text-muted/60 mb-3">
            Total books returned with fines collected
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <p className="text-anglican-blue font-medium">Total Returns</p>
              <p className="font-bold text-2xl">{stats.totalReturns}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Paid Fines</p>
              <p className="font-bold text-success">
                KSh {stats.returnedFineTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Unpaid Fines</p>
              <p className="font-bold text-destructive">
                KSh {
                returns
                  .filter((r) => r.fineStatus === "UNPAID")
                  .reduce((sum, r) => sum + r.fineAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Waived Fines</p>
              <p className="font-bold text-warning">
                KSh {
                returns
                  .filter((r) => r.fineStatus === "WAIVED")
                  .reduce((sum, r) => sum + r.fineAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
          <Card className="mt-4 p-4 sm:p-6 border border-border-dark/30 rounded-lg">
            <h4 className="text-anglican-blue font-medium mb-3">Recent Returns</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Return</TableClassName>
                  <TableCell className="text-center">Book</TableCell>
                  <TableCell className="text-center">Member</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Return Date</TableCell>
                  <TableCell className="text-center">Fine Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns
                  .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())
                  .map((returnRecord) => (
                    <TableRow
                      key={returnRecord.id}
                      className="hover:bg-angle/5 dark:hover:bg-angle/80"
                    >
                      <TableCell>
                        <div className="font-medium">{returnRecord.bookTitle}</div>
                        <div className="text-xs text-muted/60">{returnRecord.loanId}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{returnRecord.memberName}</div>
                        <div className="text-xs text-muted/60">{returnRecord.memberId}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div>{returnRecord.dueDate}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div>{returnRecord.returnDate}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            returnRecord.fineStatus === "PAID"
                              ? "default"
                              : returnRecord.fineStatus === "UNPAID"
                                ? "destructive"
                                : "warning"
                          }
                          size="sm"
                        >
                          {returnRecord.fineStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </Card>
      )}
    </div>
  )
}