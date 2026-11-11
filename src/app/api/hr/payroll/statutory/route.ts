/* HR Statutory Settings API - SaintsHub
 * GET /api/hr/payroll/statutory?year=2026  -> settings for a year (auto-seeds defaults)
 * PUT /api/hr/payroll/statutory            -> save settings (replaces PAYE band set atomically)
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import {
  resolveInstitutionId,
  getStatutorySettings,
  updateStatutorySettings,
} from "@/server/services/hr/payroll.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = await resolveInstitutionId(searchParams.get("institutionId"))
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10)
    const data = await getStatutorySettings(institutionId, year)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch statutory settings"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

const putSchema = z.object({
  institutionId: z.string().optional(),
  year: z.number().int().min(2000).max(2100),
  personalRelief: z.number().min(0).max(100_000),
  shifRate: z.number().min(0).max(0.2),
  housingLevyRate: z.number().min(0).max(0.2),
  nssfEmployeePercent: z.number().min(0).max(1),
  nssfEmployerPercent: z.number().min(0).max(1),
  nssfMaxMonthly: z.number().min(0).max(1_000_000),
  payeBands: z
    .array(
      z.object({
        minSalary: z.number().min(0),
        maxSalary: z.number().positive().nullable(),
        rate: z.number().min(0).max(0.5),
      })
    )
    .min(1)
    .max(10),
  actorId: z.string().optional(),
})

export async function PUT(request: Request) {
  try {
    const body = putSchema.parse(await request.json())
    const institutionId = await resolveInstitutionId(body.institutionId)
    const data = await updateStatutorySettings({ ...body, institutionId })
    return NextResponse.json({ success: true, data, message: `Statutory settings for ${body.year} saved` })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.issues?.[0]?.message ?? "Invalid settings" }, { status: 400 })
    }
    const msg = error?.message ?? "Failed to save statutory settings"
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
