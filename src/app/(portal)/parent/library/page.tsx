/* Parent Library - SaintsHub Parent Portal
Provides: View child's borrowed books, fines, reservations
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

interface ParentLibraryFilters {
  fineStatus?: "PAID" | "UNPAID" | "WAIVED"
  searchTerm?: string
}

export function ParentLibrary() {
  const [searchParams] = useSearchParams()
  const [member, setMember] = useState<Member | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [returns, setReturns] = useState<ReturnRecord[]>([])
  const router = useRouter()

  // Initialize from URL
  useEffect(() => {
    const status = searchParams.get("status") || ""
    setFilters({ status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const [filters, setFilters] = useState({
    status: "",
    searchTerm: "",
  })

  const fetchMember = useCallback(async (memberId: string) => {
    const response = await fetch("/api/library/members", {
      cache: "no-store",
    })
    const data = await response.json()
    const member = data.data?.find((m: any) => m.id === memberId) || null
    setMember(member)
  }, [])

  const fetchLoans = useCallback(async () => {
    const response = await fetch("/api/library/loans${searchParams.toString() ? `?${searchParams.toString()` : ""}", {
      cache: "no-store",
    })
    const data = await response.json()
    setLoans(data.data || [])
  }, [searchParams])

  const fetchReservations = useCallback(async () => {
    const response = await fetch("/api/library/reservations${searchParams.toString() ? `?${searchParams.toString()` : ""}", {
      cache: "no-store",
    })
    const data = await response.json()
    setReservations(data.data || [])
  }, [searchParams])

  const fetchReturns = useCallback(async () => {
    const response = await fetch("/api/library/returns", { cache: "no-store" })
    const data = await response.json()
    setReturns(data.data || [])
  }, [])

  useEffect(() => {
    fetchMember("member-001")
    fetchLoans()
    fetchReservations()
    fetchReturns()
  }, [fetchMember, fetchLoans, fetchReservations, fetchReturns])

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

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : loan.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        loan.memberName.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : reservation.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        reservation.memberName.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  const filteredReturns = returns.filter((returnRecord) => {
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : returnRecord.bookTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        returnRecord.memberName.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesSearch
  })

  if (!member) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center text-muted dark:text-muted-foreground py-8">
          Loading library member information...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Library Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          {member?.name}'s library overview
        </p>
      </header>

      {/* Member Overview */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{member?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-anglican-blue font-medium">Type</p>
              <p className="font-bold">{member?.type}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Grade</p>
              <p className="font-bold">{member?.grade}</p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Books Borrowed</p>
              <p className="font-bold text-destructive">
                {member?.booksBorrowed}/{member?.maxBooks}
              </p>
            </div>
            <div>
              <p className="text-anglican-blue font-medium">Fines Outstanding</p>
              <p className="font-bold text-destructive">
                KSh {member?.finesOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle>Borrowed Books {loans.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No books currently borrowed.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell className="text-center">Borrowed</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Fine</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow
                    key={loan.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{loan.bookTitle}</div>
                    </TableCell>
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

      {/* Reservations */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Active Reservations {reservations.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No active reservations.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell className="text-center">Requested</TableCell>
                  <TableCell className="text-center">Expires</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow
                    key={reservation.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{reservation.bookTitle}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{reservation.requestedDate}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>{reservation.expiryDate}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={reservation.status === "ACTIVE" ? "default" : reservation.status === "FULFILLED" ? "secondary" : "destructive"}
                        size="sm"
                      >
                        {reservation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Return Records */}
      {member && returns.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Return Records {returns.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell className="text-center">Member</TableCell>
                  <TableCell className="text-center">Fine Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((returnRecord) => (
                  <TableRow
                    key={returnRecord.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{returnRecord.bookTitle}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">{returnRecord.memberName}</div>
                      <div className="text-xs text-muted/60">{returnRecord.memberId}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={returnRecord.fineStatus === "PAID" ? "default" : returnRecord.fineStatus === "UNPAID" ? "destructive" : "warning"}
                        size="sm"
                      >
                        {returnRecord.fineStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="default"
              onClick={() => router.push("/parent/library/search")}
            >
              Search Books
            </Button>
            <Button
              variant="link"
              onClick={() => router.push("/parent/library/fees")}
            >
              View Fines
            </Button>
            <Button
              variant="link"
              onClick={() => router.push("/parent/library/reservations")}
            >
              Manage Reservations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}