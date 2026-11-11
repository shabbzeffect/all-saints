/* Seed payroll RBAC - idempotent. Run: npx tsx prisma/seed-payroll-rbac.ts
 * Creates payroll permission keys and assigns them to the seeded school roles.
 */

import { PrismaClient, PermissionScope } from "@prisma/client"
import * as fs from "fs"

const env: Record<string, string> = {}
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/)
  if (m) env[m[1]] = m[2]
}

const prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } })

const PAYROLL_PERMISSIONS = [
  { key: "hr:payroll:read", name: "View payroll", description: "View payroll runs, payslips, exports and salary loans", resource: "payroll", action: "read" },
  { key: "hr:payroll:run", name: "Prepare payroll", description: "Create, compute and cancel payroll runs", resource: "payroll", action: "run" },
  { key: "hr:payroll:finalize", name: "Approve payroll runs", description: "Finalize payroll runs (maker-checker: finalizer cannot be the run creator)", resource: "payroll", action: "finalize" },
  { key: "hr:payroll:settings", name: "Payroll statutory settings", description: "Edit PAYE/NSSF/SHIF/Housing Levy configuration per year", resource: "payroll", action: "settings" },
  { key: "hr:payroll:loans", name: "Manage salary loans", description: "Grant, cancel and settle staff salary loans and advances", resource: "payroll", action: "loans" },
] as const

const ROLE_GRANTS: Record<string, string[]> = {
  SCHOOL_PRINCIPAL: ["hr:payroll:read", "hr:payroll:run", "hr:payroll:finalize", "hr:payroll:settings", "hr:payroll:loans"],
  SCHOOL_DEPUTY: ["hr:payroll:read", "hr:payroll:finalize"],
  SCHOOL_BURSAR: ["hr:payroll:read", "hr:payroll:run", "hr:payroll:loans"],
  SCHOOL_REGISTRAR: ["hr:payroll:read"],
}

async function main() {
  const institution = await prisma.institution.findFirst({ select: { id: true, name: true } })
  if (!institution) throw new Error("No institution found")
  console.log("institution:", institution.name)

  // Upsert permissions (global template, no institutionId on Permission model)
  const permByKey = new Map<string, string>()
  for (const p of PAYROLL_PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description, resource: p.resource, action: p.action, isSystem: true },
      create: { ...p, scope: PermissionScope.INSTITUTION, isSystem: true },
    })
    permByKey.set(perm.key, perm.id)
    console.log("permission:", perm.key)
  }

  // Grant per role (idempotent)
  for (const [roleKey, keys] of Object.entries(ROLE_GRANTS)) {
    const role = await prisma.role.findFirst({
      where: { institutionId: institution.id, key: roleKey },
    })
    if (!role) {
      console.log(`role ${roleKey} not found — skipped`)
      continue
    }
    for (const key of keys) {
      const permissionId = permByKey.get(key)!
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      })
    }
    console.log("granted to", roleKey, "->", keys.join(", "))
  }

  const counts = await prisma.role.findMany({
    where: { institutionId: institution.id },
    include: { _count: { select: { permissions: true } } },
  })
  for (const r of counts) console.log("role", r.key, "has", r._count.permissions, "permissions")

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("ERR", e?.message ?? e)
  process.exit(1)
})
