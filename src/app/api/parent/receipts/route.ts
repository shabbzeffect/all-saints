import { NextResponse } from "next/http"

interface Receipt {
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

interface ReceiptsResponse {
  receipts: Receipt[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || "inst-school-1"

    // Mock receipts data - in a real app, this would fetch from database
    const mockReceipts: Receipt[] = [
      {
        id: "rec-001",
        receiptNumber: "REC-2024-001",
        amount: 15000,
        paymentMethod: "MPESA_STK_PUSH",
        issueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: "ISSUED",
        qrCodeData: "https://pay.saintshub.ac.ke/rec/REC-2024-001",
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-001",
        acknowledged: true,
      },
      {
        id: "rec-002",
        receiptNumber: "REC-2024-002",
        amount: 18500,
        paymentMethod: "BANK_DEPOSIT",
        issueDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "ACKNOWLEDGED",
        qrCodeData: "https://pay.saintshub.ac.ke/rec/REC-2024-002",
        studentName: "John Smith",
        admissionNumber: "ADM-2024-002",
        acknowledged: true,
      },
    ]

    return NextResponse.json({ success: true, data: mockReceipts })
  } catch (error) {
    console.error("Parent receipts error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch receipts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { receiptId } = await request.json()

    // Acknowledge receipt
    return NextResponse.json({
      success: true,
      data: { acknowledged: true },
    })
  } catch (error) {
    console.error("Acknowledge receipt error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to acknowledge receipt" },
      { status: 500 }
    )
  }
}