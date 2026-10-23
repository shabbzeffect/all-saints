import { NextResponse } from "next/http"

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
  try {
    const { searchParams } = new URL(request.url)
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const mandatory = searchParams.get("mandatory") === "true"
    const searchTerm = searchParams.get("search") || ""

    // Mock boarding fee data
    const mockFees: BoardingFee[] = [
      {
        id: "fee-001",
        name: "Full Boarding - Termly",
        description: "Full boarding fee per term (3 terms per year)",
        amount: 75000,
        isMandatory: true,
        applicableGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        wing: "SCHOOL",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "fee-002",
        name: "Weekly Boarding - Per Week",
        description: "Weekly boarding fee (paid per week)",
        amount: 25000,
        isMandatory: false,
        applicableGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"],
        wing: "SCHOOL",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "fee-003",
        name: "Parish Boarding - Half Term",
        description: "Half term boarding for parish members",
        amount: 35000,
        isMandatory: false,
        applicableGrades: [],
        wing: "PARISH",
        isActive: true,
        createdAt: new Date(Date.now() - 1209600000).toISOString(),
      },
    ]

    let filteredFees = mockFees

    if (wing) {
      filteredFees = filteredFees.filter((f) => f.wing === wing)
    }
    if (mandatory !== undefined) {
      filteredFees = filteredFees.filter((f) => f.isMandatory === mandatory)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredFees = filteredFees.filter(
        (f) => f.name.toLowerCase().includes(termLower) || f.description.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredFees,
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
  try {
    const body = await request.json()

    // Create new boarding fee
    const newFee: BoardingFee = {
      id: `fee-${Date.now().toString(36)}`,
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

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