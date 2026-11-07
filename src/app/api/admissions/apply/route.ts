import { NextResponse } from "next/server"
import { z } from "zod"

const GRADES = [
  "PP1", "PP2",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9",
] as const

const ApplySchema = z.object({
  guardian: z.object({
    fullName: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(9).max(20),
    relationship: z.string().trim().min(2).max(40),
    email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional(),
  }),
  child: z.object({
    fullName: z.string().trim().min(2).max(80),
    dob: z.string().trim().min(6).max(20),
    previousSchool: z.string().trim().max(120).optional(),
    grade: z.enum(GRADES),
    residence: z.enum(["DAY", "BOARDING"]),
  }),
  documents: z.object({
    birthCert: z.boolean(),
    reports: z.boolean(),
    photos: z.boolean(),
    immunisation: z.boolean(),
    originalsWillBring: z.boolean(),
  }),
  notes: z.string().trim().max(600).optional(),
})

const GRADE_MAP: Record<string, string> = {
  PP1: "PP1", PP2: "PP2",
  "Grade 1": "GRADE_1", "Grade 2": "GRADE_2", "Grade 3": "GRADE_3", "Grade 4": "GRADE_4",
  "Grade 5": "GRADE_5", "Grade 6": "GRADE_6", "Grade 7": "GRADE_7", "Grade 8": "GRADE_8", "Grade 9": "GRADE_9",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = ApplySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid application", issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { guardian, child, documents, notes } = parsed.data
    const [firstName, ...rest] = child.fullName.split(" ")
    const reference = `APP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    let stored = false
    try {
      const { prisma } = await import("@/server/db")
      const institution = await prisma.institution.findUnique({ where: { slug: "allsaints-academy" } })
      if (institution) {
        await prisma.admission.create({
          data: {
            institutionId: institution.id,
            applicantFirstName: firstName,
            applicantLastName: rest.join(" ") || null,
            applicantEmail: guardian.email || null,
            applicantPhone: guardian.phone,
            currentSchool: child.previousSchool || null,
            gradeApplyingFor: GRADE_MAP[child.grade] as never,
            source: "PORTAL",
            referredBy: null,
            notes: [
              `DOB: ${child.dob}`,
              `Residence: ${child.residence}`,
              `Guardian: ${guardian.relationship} — ${guardian.fullName}`,
              `Docs — birthCert:${documents.birthCert} reports:${documents.reports} photos:${documents.photos} immunisation:${documents.immunisation} originals:${documents.originalsWillBring}`,
              notes ? `Notes: ${notes}` : null,
            ].filter(Boolean).join("\n"),
            admissionStatus: "APPLIED",
          },
        })
        stored = true
      }
    } catch (err) {
      console.warn("[apply] database unreachable — recording application as demo (not persisted)", err)
    }

    console.log("[apply]", reference, { child: child.fullName, grade: child.grade, stored })
    return NextResponse.json({ success: true, reference, stored, demo: !stored })
  } catch {
    return NextResponse.json({ success: false, error: "Could not submit application" }, { status: 500 })
  }
}
