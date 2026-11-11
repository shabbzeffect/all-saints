import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { requireAccess } from "@/server/rbac"

interface BoardingFee {
  id: string
  name: string
  description: string
  amount: number
  isMandatory: boolean
  applicableGrades: string[]
  wing: "SCHOOL" | "PARISH"
  isActive: boolean
  createdAt: string
}

interface FeeFilter {
  wing?: "SCHOOL" | "PARISH"
  mandatory?: boolean
  searchTerm?: string
}

export async function GET(request: Request) {
  const gate = await requireAccess("portal:staff:read")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const { searchParams } = new URL(request.url)
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const mandatory = searchParams.get("mandatory") === "true"
    const searchTerm = searchParams.get("search") || ""

    const where: any = { institutionId: membership.institutionId }

    if (wing) {
      where.wing = wing
    }
    if (mandatory !== undefined) {
      where.isMandatory = mandatory
    }
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ]
    }

    const fees = await prisma.boardingFee.findMany({
      where,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: fees,
    })
  } catch (error) {
    console.error("Boarding fees error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch boarding fees" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const gate = await requireAccess("portal:staff:write")
  if ("error" in gate) return gate.error
  const { membership } = gate

  try {
    const body = await request.json()

    const newFee = await prisma.boardingFee.create({
      data: {
        name: body.name,
        description: body.description,
        amount: body.amount,
        isMandatory: body.isMandatory,
        applicableGrades: body.applicableGrades || [],
        wing: body.wing,
        institutionId: membership.institutionId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      data: newFee,
      message: "Boarding fee created successfully",
    })
  } catch (error) {
    console.error("Create boarding fee error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create boarding fee" },
      { status: 500 }
    )
  }
}

