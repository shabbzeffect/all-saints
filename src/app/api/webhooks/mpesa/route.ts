import { NextResponse } from "next/http"

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      ResultCode: number
      ResultDesc: string
      CallBackMetadata: {
        Key: string
        Value: string
      }[]
      CustomerName: string
      CustomerMSISDN: string
      Amount: number
    }
    CustomerName: string
    CustomerMSISDN: string
    Amount: number
  }
}

interface MpesaCallbackRequest {
  institutionId: string
  invoiceId: string
  paymentType: "mpesa"
  mpesaCallbackBody: MpesaCallbackBody
  processedBy: "Parent" | "Staff"
}

export async function POST(request: Request) {
  try {
    const body: MpesaCallbackRequest = await request.json()

    const { ResultCode, ResultDesc, CustomerName, CustomerMSISDN, Amount } = body.mpesaCallbackBody.Body.stkCallback
    const { invoiceId, processedBy } = body

    // Handle M-Pesa STK push callback
    let responseData: any

    if (ResultCode === 0) {
      // Payment successful
      responseData = {
        success: true,
        alreadyProcessed: false,
        payment: {
          id: invoiceId,
          receiptNumber: `REC-${invoiceId}-${Date.now().toString(36).toUpperCase().padStart(6, "0")}`,
          amount: Amount,
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
        },
      }
    } else if (body.mpesaCallbackBody.Body.CallBackMetadata.some(
      (meta: any) => meta.Key === "AccountReference" && meta.Value === invoiceId
    )) {
      // Idempotent - receipt already exists
      responseData = {
        success: true,
        alreadyProcessed: true,
        payment: {
          id: invoiceId,
          receiptNumber: "EXISTING_REC",
          amount: Amount,
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      }
    } else {
      // Payment failed
      responseData = {
        success: false,
        error: ResultDesc || "Payment failed",
      }
    }

    return NextResponse.json({ success: responseData.success, data: responseData })
  } catch (error) {
    console.error("M-Pesa webhook error:", error)
    return NextResponse.json(
      { success: false, error: "M-Pesa callback processing failed" },
      { status: 500 }
    )
  }
}