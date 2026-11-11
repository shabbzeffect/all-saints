/* middleware.ts
 * Global API gate - SaintsHub
 * Every /api/* route requires a signed-in session, except the public allowlist.
 * Fine-grained permission checks live inside route handlers (see src/server/rbac.ts).
 */

import { auth } from "@/server/auth/auth"
import { NextResponse } from "next/server"

const PUBLIC_PATTERNS = [
  /^\/api\/auth(\/|$)/,
  /^\/api\/health(\/|$)/,
  /^\/api\/enquiries(\/|$)/,
  /^\/api\/admissions\/apply(\/|$)/,
  /^\/api\/webhooks\/mpesa(\/|$)/, // Safaricom Daraja callback — enforces shared secret inside handler
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATTERNS.some((re) => re.test(pathname))) {
    return NextResponse.next()
  }
  if (!req.auth?.user) {
    return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 })
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/api/:path*"],
}
