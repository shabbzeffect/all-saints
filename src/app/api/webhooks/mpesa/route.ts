import { NextResponse } from "next/server"

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
  // Optional shared-secret guard: when MPESA_CALLBACK_SECRET is configured,
  // Safaricom (or the proxy in front of it) must present the secret.
  const secret = process.env.MPESA_CALLBACK_SECRET
  if (secret) {
    const { searchParams } = new URL(request.url)
    const presented = request.headers.get("x-mpesa-secret") ?? searchParams.get("secret")
    if (presented !== secret) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }
  }

  try {
    const body: MpesaCallbackRequest = await request.json()

    const stk = body?.mpesaCallbackBody?.Body?.stkCallback
    if (!stk) {
      return NextResponse.json({ success: false, error: "Invalid callback payload" }, { status: 400 })
    }
    const { ResultCode, ResultDesc, Amount } = stk
    const { invoiceId } = body

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
    } else if (body.mpesaCallbackBody?.Body?.stkCallback?.CallBackMetadata?.some(
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
