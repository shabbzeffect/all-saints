/* Parish Finance - SaintsHub Parish Portal
Provides: Tithes, offerings, donation tracking
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface ParishDonation {
  id: string
  donorName: string
  donorPhone: string
  donorEmail: string
  amount: number
  type: "TITHES" | "OFFERING" | "SPECIAL" | "PEW" | "OTHER"
  date: string
  paymentMethod: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
  receiptNumber: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  wing: "PARISH"
  notedBy?: string
  notedAt?: string
}

interface FinanceFilter {
  type?: "TITHES" | "OFFERING" | "SPECIAL" | "PEW" | "OTHER"
  status?: "PENDING" | "COMPLETED" | "FAILED"
  searchTerm?: string
}

export function ParishFinance() {
  const [filters, setFilters] = useState<FinanceFilter>({
    type: "",
    status: "",
    searchTerm: "",
  })
  const [donations, setDonations] = useState<ParishDonation[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    const searchTerm = searchParams.get("search") || ""
    setFilters({ type, status, searchTerm })
  }, [searchParams])

  const fetchDonations = useCallback(async () => {
    const response = await fetch(`/api/parish/payments?wing=PARISH${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setDonations(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const filteredDonations = donations.filter((donation) => {
    const matchesType = filters.type ? donation.type === filters.type : true
    const matchesStatus = filters.status ? donation.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : donation.donorName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          donation.receiptNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

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
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-purple dark:text-anglican-purple-100">
          Parish Finance
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Tithes, offerings & donations tracking
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
                  <SelectItem value="TITHES">Tithes</SelectItem>
                  <SelectItem value="OFFERING">Offering</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                  <SelectItem value="PEW">Pew</SelectItem>
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
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by name or receipt number..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{donations.length} Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDonations.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No donations found. Record a donation first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Donor</TableClassName>
                  <TableClassName className="text-right">Amount</TableClassName>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Method</TableCell>
                  <TableCell className="text-center">Receipt</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow
                    key={donation.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{donation.donorName}</div>
                      <div className="text-xs text-muted/60">{donation.donorPhone}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {donation.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          donation.type === "TITHES"
                            ? "default"
                            : donation.type === "OFFERING"
                              ? "secondary"
                              : donation.type === "SPECIAL"
                                ? "destructive"
                                : donation.type === "PEW"
                                  ? "default"
                                  : "default"
                        }
                        size="sm"
                      >
                        {donation.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          donation.paymentMethod === "MPESA_STK_PUSH"
                            ? "default"
                            : donation.paymentMethod === "BANK_DEPOSIT"
                              ? "secondary"
                              : donation.paymentMethod === "CASH"
                                ? "default"
                                : "default"
                        }
                        size="sm"
                      >
                        {donation.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">{donation.receiptNumber}</div>
                      <div className="text-xs text-muted/60">{new Date(donation.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          donation.status === "PENDING"
                            ? "secondary"
                            : donation.status === "COMPLETED"
                              ? "default"
                              : "destructive"
                        }
                        size="sm"
                      >
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria-label="View donation details"
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

      {/* Record Donation Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Record Donation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Donor Name</label>
              <Input name="donorName" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Phone</label>
              <Input
                type="tel"
                name="donorPhone"
                placeholder="+254712345678"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Email</label>
              <Input
                type="email"
                name="donorEmail"
                placeholder="donor@email.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Amount</label>
              <Input
                type="number"
                name="amount"
                placeholder="0"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select defaultValue="OFFERING" name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TITHES">Tithes</SelectItem>
                  <SelectItem value="OFFERING">Offering</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                  <SelectItem value="PEW">Pew</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Payment Method</label>
              <Select defaultValue="MPESA_STK_PUSH" name="paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MPESA_STK_PUSH">M-Pesa STK Push</SelectItem>
                  <SelectItem value="BANK_DEPOSIT">Bank Deposit</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Record Donation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}