/* eslint-disable react/prop-types */
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/spinner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ReceiptItem {
  id: string
  receiptNumber: string
  amount: number
  paymentMethod: "MPESA_STK_PUSH" | "BANK_DEPOSIT" | "CASH" | "CHEQUE"
  issueDate: string
  status: "ISSUED" | "ACKNOWLEDGED" | "VOID"
  qrCodeData: string
  studentName: string
  admissionNumber: string
  acknowledged: boolean
}

interface ReceiptsProps {
  receipts: ReceiptItem[]
  onAcknowledge: (receiptId: string) => void
}

export function Receipts({ receipts, onAcknowledge }: ReceiptsProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fetch receipts from API if not provided
    // In a real app, would call /api/parent/receipts
  }, [])

  const handleAcknowledge = async (receiptId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/parent/receipts/acknowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiptId }),
      })

      const data = await response.json()

      if (response.ok) {
        onAcknowledge(receiptId)
        setSelectedReceipt(null)
        router.refresh()
      } else {
        alert("Failed to acknowledge receipt: " + (data.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Acknowledge error:", error)
      alert("Failed to acknowledge receipt. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (receipts.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted dark:text-muted-foreground">
          No receipts found. Make a payment to generate receipts.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Receipts
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Payment receipts for your children
        </p>
      </div>

      {/* Receipts Table */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableClassName>Receipt No.</TableClassName>
                <TableCell>Student</TableCell>
                <TableCell className="text-right">Amount</TableCell>
                <TableCell className="text-center">Method</TableCell>
                <TableCell className="text-center">Date</TableCell>
                <TableCell className="text-center">Status</TableCell>
                <TableCell className="text-center">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id} className="hover:bg-angle/5 dark:hover:bg-angle/80">
                  <TableCell>{receipt.receiptNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{receipt.studentName}</div>
                    <div className="text-xs text-muted/60">Adm: {receipt.admissionNumber}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    KSh {receipt.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 text-xs rounded {receipt.paymentMethod === 'MPESA_STK_PUSH' ? 'bg-angle/10 text-angle' : 'bg-muted/10 text-muted/60'}">
                      {receipt.paymentMethod === 'MPESA_STK_PUSH'
                        ? "M-Pesa"
                        : receipt.paymentMethod === 'BANK_DEPOSIT'
                          ? "Bank"
                          : receipt.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">{new Date(receipt.issueDate).toLocaleDateString()}</div>
                    <div className="text-xs text-muted/60">{new Date(receipt.issueDate).toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={receipt.acknowledged ? "default" : "destructive"}
                      size="sm"
                    >
                      {receipt.acknowledged ? "Acknowledged" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {receipt.acknowledged ? (
                      <span className="text-muted/60">✓</span>
                    ) : (
                      <Button
                        size="icon"
                        variant="link"
                        onClick={() => setSelectedReceipt(receipt)}
                        aria-label="Acknowledge receipt"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M15.66 3.79a.75.75 0 00-.3-.86l-7.61 2.15a3.5 3.5 0 01-2.07-1.09H4.58a3.5 3.5 0 01-2.07 1.09l-7.61-2.15a.75.75 0 00-.8.34 7.027 7.027 0 001.83 2.15l.31.13a.75.75 0 00.3.86l7.62-2.15a7.577 7.577 0 001.98-.06 7.576 7.576 0 002.19 1.41l.28.31a.75.75 0 00.3.85l-7.63 2.16a.75.75 0 00-.3.86 11.928 11.928 0 011.78 1.23l.32-.12a.75.75 0 00-.3-.85l7.61 2.15a11.958 11.958 0 001.76-1.23l.31.12a.75.75 0 00.3-.86l-7.62-2.15a9.235 9.235 0 00-.29-1.37l-.3-.11a.75.75 0 00-.3-.85 8.987 8.987 0 011.06-2.15l7.61 2.15zM7.5 9.95a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acknowledge Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-zxl z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl transform scale-100 transition-transform duration-300">
            <h2 className="font-semibold text-anglican-blue mb-4">Acknowledge Receipt</h2>
            <p className="text-muted/60 mb-6">
              Confirm that you have received and verified the receipt details for
              <strong className="font-medium">{selectedReceipt.receiptNumber}</strong>
            </p>

            <div className="mb-6 p-4 rounded bg-angle/5 dark:bg-angle/20">
              <h3 className="font-medium text-anglican-blue mb-2">Receipt Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted/60">Receipt Number:</span>
                  <span className="font-medium">{selectedReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-muted/60">Amount:</span>
                  <span className="font-medium text-anglican-blue">KSh {selectedReceipt.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted/60">Date:</span>
                  <span className="font-medium">{new Date(
                    selectedReceipt.issueDate
                  ).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted/60">Method:</span>
                  <span className="font-medium">
                    {selectedReceipt.paymentMethod === 'MPESA_STK_PUSH' ? "M-Pesa" : "Bank"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleAcknowledge(selectedReceipt.id)}
              className="w-full"
            >
              {loading ? (
                <LoadingSpinner className="h-4 w-4 me-2" />
              ) : "Acknowledge Receipt"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedReceipt(null)}
              className="mt-3 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}