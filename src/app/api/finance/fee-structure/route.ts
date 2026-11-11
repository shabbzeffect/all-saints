/* AUTO-STUB - written against an Express-style dispatcher that never existed,
 * and against a service layer that does not compile against the current schema.
 * Every handler fails closed with 501 until rebuilt on the Prisma models in
 * prisma/schema.prisma. See git history for the original code.
 */
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const message = "Not implemented - this module was written against an abandoned service layer and has not been built yet"

export async function GET() {
  return NextResponse.json({ success: false, error: message }, { status: 501 })
}
export async function POST() {
  return NextResponse.json({ success: false, error: message }, { status: 501 })
}
export async function PUT() {
  return NextResponse.json({ success: false, error: message }, { status: 501 })
}
export async function PATCH() {
  return NextResponse.json({ success: false, error: message }, { status: 501 })
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: message }, { status: 501 })
}
