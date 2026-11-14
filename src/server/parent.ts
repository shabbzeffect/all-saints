/* Parent portal helpers - resolves the signed-in user to their guardian profile.
 * Parents are scoped to their own linked children; no institution membership required.
 */
import { NextResponse } from "next/server"
import { auth } from "@/server/auth/auth"
import { prisma } from "@/server/db"

export type GuardianContext = { userId: string; guardianId: string; institutionId: string }

export async function getGuardianContext(): Promise<
  { guardian: GuardianContext } | { error: NextResponse }
> {
  const session = await auth()
  const sessionUser = session?.user as { id?: string; email?: string | null } | undefined
  if (!sessionUser) {
    return { error: NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 }) }
  }

  let userId = sessionUser.id ?? null
  if (!userId && sessionUser.email) {
    const user = await prisma.user.findUnique({ where: { email: sessionUser.email }, select: { id: true } })
    userId = user?.id ?? null
  }
  if (!userId) {
    return { error: NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 }) }
  }

  const guardian = await prisma.guardian.findUnique({ where: { userId } })
  if (!guardian) {
    return {
      error: NextResponse.json(
        { success: false, error: "No guardian profile is linked to your account" },
        { status: 403 },
      ),
    }
  }

  return { guardian: { userId, guardianId: guardian.id, institutionId: guardian.institutionId } }
}
