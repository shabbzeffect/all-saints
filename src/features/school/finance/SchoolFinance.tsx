/* School Finance - SaintsHub School Portal
Provides: Fee structure management, payment tracking, financial reports
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface FeeStructure {
  id: string
  name: string
  description: string
  amount: number
  frequency: "ONCE" | "TERMLY" | "ANNUAL" | "MONTHLY"
  isMandatory: boolean
  applicableGrades: string[]
  wing: "SCHOOL"
}

interface FeePayment {
  id: string
  studentId: string
  admissionNumber: string
  studentName: string
  feeStructureId: string
  amount: number
  paymentMethod: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
  paymentDate: string
  receiptNumber: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  acknowledged: boolean
  createdAt: string
}

interface FinanceFilter {
  grade?: string
  mandatory?: boolean
  status?: "PENDING" | "COMPLETED" | "FAILED"
  searchTerm?: string
}

export function SchoolFinance() {
  const [filters, setFilters] = useState<FinanceFilter>({
    grade: "",
    mandatory: "",
    status: "",
    searchTerm: "",
  })
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const grade = searchParams.get("grade") || ""
    const mandatory = searchParams.get("mandatory")
    const status = searchParams.get("status") || ""
    const searchTerm = searchParams.get("search") || ""
    setFilters({ grade, mandatory: mandatory === "true", status, searchTerm })
  }, [searchParams])

  const fetchFeeStructure = useCallback(async () => {
    const response = await fetch(`/api/school/finance${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setFeeStructure(data.data?.feeStructure || [])
  }, [searchParams])

  const fetchPayments = useCallback(async () => {
    const response = await fetch(`/api/school/finance/payments${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setPayments(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchFeeStructure()
    fetchPayments()
  }, [fetchFeeStructure, fetchPayments])

  const filteredFeeStructure = feeStructure.filter((fs) => {
    const matchesGrade = filters.grade ? fs.applicableGrades.includes(filters.grade) : true
    const matchesMandatory = filters.mandatory !== undefined ? fs.isMandatory === filters.mandatory : true
    return matchesGrade && matchesMandatory
  })

  const filteredPayments = payments.filter((payment) => {
    const matchesGrade = filters.grade
      ? payment.admissionNumber.includes(filters.grade) ||
        payment.studentName.toLowerCase().includes(filters.grade.toLowerCase())
      : true
    const matchesStatus = filters.status ? payment.status === filters.status : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : payment.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          payment.admissionNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          payment.receiptNumber.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesGrade && matchesStatus && matchesSearch
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
          School Finance
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Fee structure & payment tracking
        </p>
      </header>

      {/* Fee Structure */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFeeStructure.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No fee structure found. Add fees first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Fee</TableClassName>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Frequency</TableCell>
                  <TableCell className="text-center">Mandatory</TableCell>
                  <TableCell className="text-center">Grades</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeeStructure.map((fs) => (
                  <TableRow
                    key={fs.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>{fs.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {fs.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm {fs.frequency === "ONCE" ? "text-muted" : "text-anglican-blue"}">
                        {fs.frequency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={fs.isMandatory ? "default" : "secondary"}
                        size="sm"
                      >
                        {fs.isMandatory ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {fs.applicableGrades.length > 0
                          ? fs.applicableGrades.join(", ")
                          : "All grades"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View fee details"
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

      {/* Payments History */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No payments found. Make a payment first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Student</TableClassName>
                  <TableCell className="text-right">Amount</TableCell>
                  <TableCell className="text-center">Method</TableCell>
                  <TableCell className="text-center">Receipt</TableCell>
                  <TableCell className="text-center">Status</TableCell>
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
                      <div className="font-medium">{payment.studentName}</div>
                      <div className="text-xs text-muted/60">{payment.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={payment.paymentMethod === "MPESA_STK_PUSH" ? "default" : payment.paymentMethod === "BANK_DEPOSIT" ? "secondary" : "default"}
                        size="sm"
                      >
                        {payment.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">{payment.receiptNumber}</div>
                      <div className="text-xs text-muted/60">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={payment.status === "PENDING" ? "secondary" : payment.status === "COMPLETED" ? "default" : "destructive"}
                        size="sm"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View payment details"
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
              <label className="text-sm text-muted/60 mb-1">Student</label>
              <Select defaultValue="" name="student">
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select student</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-sm text-muted/60 mb-1">Fee Structure</label>
              <Select defaultValue="" name="feeStructure">
                <SelectTrigger>
                  <SelectValue placeholder="Select fee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select fee structure</SelectItem>
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
                Record Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}