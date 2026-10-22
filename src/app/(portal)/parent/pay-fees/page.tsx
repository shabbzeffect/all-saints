/* eslint-disable react/prop-types */
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface InvoiceItem {
  id: string
  invoiceNumber: string
  totalAmount: number
  amountPaid: number
  amountRemaining: number
  dueDate: string
  status: "DRAFT" | "PARTIALLY_PAID" | "FULLY_PAID"
  studentName: string
  admissionNumber: string
}

interface PayFeesProps {
  invoices: InvoiceItem[]
  onPaymentSuccess: (invoiceId: string, receiptNumber: string) => void
}

export function PayFees({ invoices, onPaymentSuccess }: PayFeesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "bank">("mpesa")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayMpesa = async (invoice: InvoiceItem) => {
    setLoading(true)
    try {
      // Call the API to record M-Pesa payment (simulates STK push callback)
      const response = await fetch("/api/parent/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institutionId: "inst-school-1",
          invoiceId: invoice.id,
          paymentType: "mpesa",
          mpesaCallbackBody: {
            Body: {
              stkCallback: {
                MerchantRequestID: "TEST-001",
                ResultCode: 0,
                ResultDesc: "Success",
                CallBackMetadata: [
                  { Key: "AccountReference", Value: invoice.invoiceNumber },
                ],
                CustomerName: "Test Parent",
                CustomerMSISDN: "+254712345678",
                Amount: invoice.amountRemaining,
              },
            },
            CustomerName: "Test Parent",
          },
          processedBy: "Parent",
        }),
      })

      const data = await response.json()

      if (response.ok && data.alreadyProcessed) {
        // Idempotent - receipt already exists
        onPaymentSuccess(invoice.id, data.payment.receiptNumber || invoice.invoiceNumber)
      } else if (response.ok && data.payment) {
        // New payment processed
        onPaymentSuccess(invoice.id, data.payment.receiptNumber || invoice.invoiceNumber)
        setSelectedInvoice(null)
        router.refresh()
      } else {
        alert("Payment failed: " + (data.message || "Unknown error"))
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePayBank = async (invoice: InvoiceItem) => {
    setLoading(true)
    try {
      const response = await fetch("/api/parent/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institutionId: "inst-school-1",
          invoiceId: invoice.id,
          paymentType: "bank",
          bankTransactionData: {
            reference: `REF-${invoice.invoiceNumber}`,
            amount: invoice.amountRemaining,
            paymentMethod: "BANK_DEPOSIT",
            bankName: "Co-op Bank",
            branch: "Moshi Branch",
            chequeNumber: "",
            notes: `Payment for ${invoice.invoiceNumber} - ${invoice.studentName}`,
          },
          processedBy: "Parent",
        }),
      })

      const data = await response.json()

      if (response.ok && data.payment) {
        onPaymentSuccess(invoice.id, data.payment.receiptNumber || invoice.invoiceNumber)
        setSelectedInvoice(null)
        router.refresh()
      } else {
        alert("Bank payment failed: " + (data.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Bank payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted dark:text-muted-foreground">
          No outstanding invoices found.
        </p>
      </div>
    )
  }

  // Filter to only invoices with remaining balance
  const payableInvoices = invoices.filter(
    (inv) => inv.status !== "FULLY_PAID" && inv.amountRemaining > 0
  )

  if (payableInvoices.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-success dark:text-success-300">
          All invoices are fully paid! Thank you.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Pay Fees
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Select an invoice to pay
        </p>
      </div>

      {/* Invoice Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Select Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {payableInvoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                className={`cursor-pointer rounded-lg border ${selectedInvoice?.id === invoice.id ? "border-anglican-blue bg-angle/5" : "border-border/30 hover:bg-angle/30 transition-colors dark:border-dark/40 dark:hover:bg-dark/30"}`}
              >
                <div className="px-4 py-3">
                  <div className="font-medium">{invoice.studentName} (${invoice.admissionNumber})</div>
                  <div className="text-sm text-muted/60">
                    Invoice: {invoice.invoiceNumber} · Due: {new Date(
                      invoice.dueDate
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="pt-2 flex items-end justify-between">
                  <div>
                    <div className="font-medium text-anglican-blue">
                      KSh {invoice.amountRemaining.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted/60">Remaining</div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-anglican-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.05 4.95a2 2 0 012.83 0l7.11 7.11a2 2 0 010 2.83l-7.11 7.11a2 2 0 01-2.83-2.83L11.88 12H3a2 2 0 01-2-2V5a2 2 0 012-2h2.88l4.38-4.38a2 2 0 010 2.83z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {selectedInvoice && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Pay Invoice {selectedInvoice.invoiceNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Student</span>
                <div className="mt-1">
                  <span className="font-medium text-anglican-blue">
                    {selectedInvoice.studentName} ({selectedInvoice.admissionNumber})
                  </span>
                  <div className="text-sm text-muted/60">Grade {selectedInvoice.studentName.split(" ")[1] || "—"}</div>
                </div>
              </div>

              <div>
                <span className="font-medium">Amount Due</span>
                <div className="mt-1">
                  <span className="font-medium text-anglican-blue">
                    KSh {selectedInvoice.amountRemaining.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-medium">Payment Method</span>
                <Select
                  onValueChange={(val) => setPaymentMethod(val as "mpesa" | "bank")}
                  defaultValue="mpesa"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa STK Push</SelectItem>
                    <SelectItem value="bank">Bank Transfer / Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* M-Pesa Specific Info */}
              {paymentMethod === "mpesa" && (
                <div>
                  <span className="font-medium">Pay Bill Number</span>
                  <div className="mt-1">
                    <span className="font-mono text-anglican-blue">174379</span>
                    <div className="text-xs text-muted/60">SaintsHub School</div>
                  </div>
                  <span className="mt-2 block text-sm text-muted/60">
                    Enter your phone number +2547... when prompted
                  </span>
                </div>
              )}

              {/* Bank Specific Info */}
              {paymentMethod === "bank" && (
                <div>
                  <span className="font-medium">Bank Details</span>
                  <div className="mt-1 space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Bank:</span> Co-op Bank
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Branch:</span> Moshi Branch
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Account:</span> 01124023456789
                    </div>
                    <div className="text-sm text-muted/60">
                      <span className="font-medium">Reference:</span> {selectedInvoice.invoiceNumber} + Parent Name
                    </div>
                  </div>
                  <span className="mt-2 text-sm text-muted/60">
                    Deposit slip must be uploaded via the receipts page after payment
                  </span>
                </div>
              )}

              <Button
                disabled={loading}
                variant="primary"
                onClick={() => {
                  if (paymentMethod === "mpesa") {
                    handlePayMpesa(selectedInvoice)
                  } else {
                    handlePayBank(selectedInvoice)
                  }
                }}
              >
                {loading ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  paymentMethod === "mpesa"
                    ? "Pay via M-Pesa"
                    : "Confirm Bank Transfer"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}