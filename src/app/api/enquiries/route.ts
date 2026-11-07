import { NextResponse } from "next/server"
import { z } from "zod"

const EnquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(9).max(20),
  grade: z.string().trim().max(32).nullish(),
  date: z.string().trim().max(32).nullish(),
  message: z.string().trim().max(500).nullish(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = EnquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid enquiry", issues: parsed.error.issues },
        { status: 400 }
      )
    }
    const reference = `ENQ-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    console.log("[enquiry]", reference, {
      name: parsed.data.name,
      phone: parsed.data.phone,
      grade: parsed.data.grade,
      date: parsed.data.date,
    })
    return NextResponse.json({ success: true, reference, demo: true, stored: false })
  } catch {
    return NextResponse.json({ success: false, error: "Could not record enquiry" }, { status: 500 })
  }
}
