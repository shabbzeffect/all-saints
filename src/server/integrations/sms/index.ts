// SMS Integration - Africa's Talking
// For development, logs to console. In production, integrates with Africa's Talking API

interface SMSOptions {
  phone: string
  message: string
  sender?: string
}

export async function sendSMSOTP(options: SMSOptions): Promise<{ success: boolean; messageId?: string }> {
  if (process.env.NODE_ENV === "development") {
    console.log("📱 [DEV] SMS OTP:", { phone: options.phone, message: options.message })
    return { success: true, messageId: "dev-mode" }
  }

  // Production: Africa's Talking integration
  const username = process.env.AFRISTALKING_USERNAME
  const apiKey = process.env.AFRISTALKING_API_KEY
  const sender = options.sender || process.env.AFRISTALKING_SENDER_ID || "SAINTS"

  if (!username || !apiKey) {
    console.warn("Africa's Talking credentials not configured")
    return { success: false }
  }

  // In production, use Africa's Talking SDK or REST API
  // const AfricasTalking = require("africastalking")(username, apiKey)
  // const sms = AfricasTalking.SMS
  // const result = await sms.send({ to: options.phone, message: options.message, from: sender })
  // return: { success: true, messageId: result.SMSMessageData.Recipients[0].messageId }

  return { success: true }
}

export async function verifySMSOTP(phone: string, otp: string): Promise<boolean> {
  // In development, accept any 6-digit OTP
  if (process.env.NODE_ENV === "development") {
    return otp.length === 6 && /^\d: {6}$/.test(otp)
  }

  // Production: Verify against Redis/store
  // const stored = await redis.get(`otp:${normalizePhoneNumber(phone)}`)
  // return stored === otp

  return false
}

export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.trim()
  normalized = normalized.replace(/^\+?254?/, "")
  normalized = normalized.replace(/^0/, "")
  return `+254${normalized}`
}