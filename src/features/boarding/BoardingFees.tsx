/* Boarding Fees - SaintsHub Boarding Module
Provides: View billing, payment history, due dates, payment integration
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface BillingRecord {
  id: string
  studentId: string
  studentName: string
  studentAdmission: string
  feeName: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
}

interface BillingFilter {
  status?: "PENDING" | "PAID" | "OVERDUE"
  searchTerm?: string
}

interface PaymentForm {
  feeId: string
  amount: number
  paymentMethod: string
  transactionId: string
  receiptNumber: string
}

export function BoardingFees() {
  const [searchParams] = useSearchParams()
  const [billing, setBilling] = useState<BillingRecord[]>([])
  const [filters, setFilters] = useState<BillingFilter>({
    status: "",
    searchTerm: "",
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [transactionId, setTransactionId] = useState("")

  const paymentMethods: PaymentMethod[] = [
    {
      id: "mpesa",
      name: "M-Pesa STK Push",
      icon: "💳",
      description: "Mobile money transfer",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "🏦",
      description: "Direct bank transfer",
    },
    {
      id: "card",
      name: "Card Payment",
      icon: "💳",
      description: "Credit/debit card",
    },
  ]

  // Fetch billing data
  const fetchBilling = useCallback(async () => {
    const response = await fetch(`/api/boarding/fees/billing${searchParams.toString() ? `&${searchParams.toString()` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setBilling(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchBilling()
  }, [fetchBilling])

  const filteredBilling = billing.filter((billing) => {
    const matchesStatus = filters.status ? billing.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : billing.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        billing.feeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        billing.receiptNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const handleStatusChange = useCallback(
    (status: "PENDING" | "PAID" | "OVERDUE") => {
      setFilters((prev) => ({ ...prev, status }))
    },
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, searchTerm: value }))
    },
    []
  )

  const totalDue = billing
    .filter((b) => b.status === "PENDING" || b.status === "OVERDUE")
    .reduce((sum, b) => sum + b.amount, 0)

  const totalPaid = billing
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + b.amount, 0)

  const openPaymentModal = useCallback((billing: BillingRecord) => {
    setSelectedBilling(billing)
    setPaymentMethod("")
    setTransactionId("")
    setPaymentModalOpen(true)
  }, [])

  const closePaymentModal = useCallback(() => {
    setPaymentModalOpen(false)
    setSelectedBilling(null)
    setPaymentMethod("")
    setTransactionId("")
  }, [])

  const processPayment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBilling || !paymentMethod || !transactionId) {
      return
    }

    const paymentData: PaymentForm = {
      feeId: selectedBilling.id,
      amount: selectedBilling.amount,
      paymentMethod,
      transactionId,
      receiptNumber: `REC-${Date.now().toString(36).toUpperCase()}-${selectedBilling.studentId}`,
    }

    // In a real app, would call payment API
    // await fetch("/api/boarding/fees/pay", {
    //   method: "POST",
    //   body: JSON.stringify(paymentData)
    // })

    // Mark as paid
    const updatedBilling = billing.map((b) =>
      b.id === selectedBilling.id
        ? { ...b, status: "PAID", paidDate: new Date().toISOString().split("T")[0], paymentMethod, receiptNumber: paymentData.receiptNumber }
        : b
    )

    setBilling(updatedBilling)
    closePaymentModal()
  }, [billing, selectedBilling, paymentMethod, transactionId, closePaymentModal])

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Boarding Fees
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Billing & payment history
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
              <label className="text-sm text-muted/60 mb-1">Status</label>
              <Select
                onValueChange={handleStatusChange}
                defaultValue=""
                name="status"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by student name or receipt number..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>{billing.length} Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBilling.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-4">
              No billing records found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Period</TableCell>
                  <TableCell className="text-center">Due Date</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBilling.map((billing) => (
                  <TableRow
                    key={billing.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{billing.studentName}</div>
                      <div className="text-xs text-muted/60">{billing.studentAdmission}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">KSh {billing.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{billing.period}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={billing.status === "PENDING" ? "secondary" : billing.status === "PAID" ? "default" : "destructive"}
                        size="sm"
                      >
                        {billing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">{billing.dueDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        {billing.status !== "PAID" && (
                          <Button
                            size="icon"
                            variant="link"
                            className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                            onClick={() => openPaymentModal(billing)}
                            aria="Pay billing"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 15a5 5 0 100-10 5 5 0 000 10zM1 4.59l4.23 3.78a1 1 0 01.76 1.37h6.83l-.95 2.87a1 1 0 01-1.67.52l-5.62-3.18a1 1 0 01-.56-1.07zM6.06 1a1 1 0 011 1v6a1 1 0 11-2 0V2a1 1 0 011-1zm0 5.5v5a1 1 0 11-2 0V7a1 1 0 011 0zm3.54-1.83l-2.05 1.83a1 1 0 01-1.07-.5l-5.62 3.18a1 1 0 11-.56-1.07l5.62-3.18a1 1 0 01.52.37l2.05-1.83a1 1 0 011.07.51h6.07z" />
                            </svg>
                          </Button>
                        )}
                        {billing.status === "PAID" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-success"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-5.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                          </svg>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {billing.status !== "PAID" && (
                        <Button
                          size="icon"
                          variant="link"
                          className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                          onClick={() => openPaymentModal(billing)}
                          aria="Pay billing"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 8a2 2 0 110-4 2 2 0 010 4zM9.5 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm4.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm3 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                          </svg>
                        </Button>
                      )}
                      {billing.status === "PAID" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-success"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-5.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                        </svg>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {paymentModalOpen && selectedBilling && (
        <Card className="mt-6 p-6 sm:p-8">
          <CardHeader>
            <CardTitle>Pay Fee - {selectedBilling.studentName}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={processPayment} className="space-y-4">
              <div>
                <label className="text-anglican-blue font-medium">Outstanding Amount</label>
                <p className="font-bold text-2xl text-destructive">KSh {selectedBilling.amount.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-anglican-blue font-medium">Payment Method</label>
                <Select
                  defaultValue=""
                  name="paymentMethod"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem
                        key={method.id}
                        value={method.id}
                      >
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          <span>{method.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-anglican-blue font-medium">Transaction ID</label>
                <Input
                  placeholder="Enter transaction ID..."
                  value={transactionId}
                  onValueChange={(e) => setTransactionId(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-anglican-blue font-medium">Receipt Number</label>
                <Input
                  placeholder="Will be generated automatically"
                  readOnly
                  value={selectedBilling.receiptNumber || `REC-${Date.now().toString(36).toUpperCase()}-${selectedBilling.studentId}`}
                  className="w-full"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                >
                  Process Payment
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={closePaymentModal}
                  className="ml-2 w-full justify-end"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="mt-4 p-4 sm:p-6 border border-border-dark/30 rounded-lg">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-anglican-blue font-medium">Total Due</p>
            <p className="font-bold text-2xl text-destructive">
              KSh {totalDue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-anglican-blue font-medium">Total Paid</p>
            <p className="font-bold text-2xl text-success">
              KSh {totalPaid.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}