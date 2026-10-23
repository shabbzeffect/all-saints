import { NextResponse } from "next/http"

interface SmsCallbackBody {
  message: string
  phoneNumber: string
  status: "DELIVERED" | "FAILED"
  timestamp: string
  reference: string
}

interface SmsCallbackRequest {
  institutionId: string
  paymentId: string
  smsCallbackBody: SmsCallbackBody
}

export async function POST(request: Request) {
  try {
    const body: SmsCallbackRequest = await request.json()

    const { status, phoneNumber, reference } = body.smsCallbackBody

    // Handle SMS callback
    let responseData: any

    if (status === "DELIVERED") {
      responseData = {
        success: true,
        data: {
          smsId: reference,
          status: "DELIVERED",
          deliveredTo: phoneNumber,
          deliveredAt: body.smsCallbackBody.timestamp,
          message: "SMS delivered successfully",
        },
      }
    } else {
      responseData = {
        success: true,
        data: {
          smsId: reference,
          status: "FAILED",
          deliveredTo: phoneNumber,
          message: "SMS delivery failed",
        },
      }
    }

    return NextResponse.json({ success: responseData.success, data: responseData.data })
  } catch (error) {
    console.error("SMS webhook error:", error)
    return NextResponse.json(
      { success: false, error: "SMS callback processing failed" },
      { status: 500 }
    )
  }
}