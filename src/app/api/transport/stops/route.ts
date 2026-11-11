/* AUTO-STUB - written against a schema that never existed.
 * Every handler fails closed with 501 until this module is rebuilt against
 * the Prisma models in prisma/schema.prisma. Do not route traffic here.
 */
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const message = "Not implemented - this module was written against a placeholder schema and has not been built yet"

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
