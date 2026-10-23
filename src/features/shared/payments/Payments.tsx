/* Shared Payments - SaintsHub Platform
Provides: Payment records across all wings and types
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Payment {
  id: string
  type: "SCHOOL_FEES" | "PARISH_OFFERING" | "TRANSPORT" | "BOARDING" | "OTHER"
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  payerName: string
  payerPhone?: string
  payerEmail?: string
  institutionId?: string
  description: string
  referenceNumber?: string
  transactionId?: string
  createdAt: string
  processedAt?: string
  metadata?: {
    paymentMethod?: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
    receiptNumber?: string
  }
}

interface PaymentFilter {
  type?: "SCHOOL_FEES" | "PARISH_OFFERING" | "TRANSPORT" | "BOARDING" | "OTHER"
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  searchTerm?: string
}

export function Payments() {
  const [filters, setFilters] = useState<PaymentFilter>({
    type: "",
    status: "",
    searchTerm: "",
  })
  const [payments, setPayments] = useState<Payment[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    setFilters({ type, status, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchPayments = useCallback(async () => {
    const response = await fetch(`/api/shared/payments${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setPayments(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const filteredPayments = payments.filter((payment) => {
    const matchesType = filters.type ? payment.type === filters.type : true
    const matchesStatus = filters.status ? payment.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : payment.payerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          payment.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          payment.referenceNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
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
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Payments
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Payment records and transactions
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
                  <SelectItem value="SCHOOL_FEES">School Fees</SelectItem>
                  <SelectItem value="PARISH_OFFERING">Parish Offering</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="BOARDING">Boarding</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by payer name or reference..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{payments.length} Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No payments found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Payer</TableClassName>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Reference</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{payment.payerName}</div>
                      <div className="text-xs text-muted/60">{payment.payerPhone || payment.payerEmail || ""}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={payment.type === "SCHOOL_FEES" ? "default" : payment.type === "PARISH_OFFERING" ? "secondary" : payment.type === "TRANSPORT" ? "default" : "default"}
                        size="sm"
                      >
                        {payment.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={payment.status === "PENDING" ? "secondary" : payment.status === "COMPLETED" ? "default" : payment.status === "FAILED" ? "destructive" : "destructive"}
                        size="sm"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium text-sm">{payment.referenceNumber || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View payment"
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

      {/* Record Payment Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select defaultValue="SCHOOL_FEES" name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHOOL_FEES">School Fees</SelectItem>
                  <SelectItem value="PARISH_OFFERING">Parish Offering</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="BOARDING">Boarding</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Amount</label>
              <Input
                type="number"
                name="amount"
                min="1"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Currency</label>
              <Input
                type="text"
                name="currency"
                placeholder="KES"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Payer Name</label>
              <Input name="payerName" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Payer Phone</label>
              <Input
                type="tel"
                name="payerPhone"
                placeholder="+254712345678"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Payer Email</label>
              <Input
                type="email"
                name="payerEmail"
                placeholder="payer@email.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Description</label>
              <Input name="description" className="w-full" placeholder="Payment description" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Reference Number</label>
              <Input name="referenceNumber" className="w-full" />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Record Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}