import { NextResponse } from "next/server"

interface Assessment {
  id: string
  title: string
  description: string
  assessmentType: "FORMATIVE" | "SUMMATIVE" | "SBA"
  grade: string
  subject: string
  term: string
  maxScore: number
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  createdAt: string
}

interface AssessmentFilter {
  grade?: string
  type?: "FORMATIVE" | "SUMMATIVE" | "SBA" | ""
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED" | ""
  searchTerm?: string
}

const mockAssessments: Assessment[] = [
  {
    id: "asmt-001",
    title: "Term 1 Mathematics Test",
    description: "End of term mathematics assessment",
    assessmentType: "FORMATIVE",
    grade: "Grade 7",
    subject: "Mathematics",
    term: "Term 1",
    maxScore: 100,
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "asmt-002",
    title: "Science Quiz - Matter",
    description: "Quiz on states of matter",
    assessmentType: "FORMATIVE",
    grade: "Grade 8",
    subject: "Science",
    term: "Term 1",
    maxScore: 50,
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "asmt-003",
    title: "History Midterm",
    description: "Midterm exam on colonial history",
    assessmentType: "SUMMATIVE",
    grade: "Grade 9",
    subject: "History",
    term: "Term 2",
    maxScore: 200,
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "asmt-004",
    title: "English Essay Assignment",
    description: "Creative writing essay",
    assessmentType: "SBA",
    grade: "Grade 7",
    subject: "English",
    term: "Term 1",
    maxScore: 75,
    status: "DRAFT",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: "asmt-005",
    title: "Physics Practical",
    description: "Physics laboratory practical exam",
    assessmentType: "SUMMATIVE",
    grade: "Grade 10",
    subject: "Physics",
    term: "Term 2",
    maxScore: 100,
    status: "ARCHIVED",
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: "asmt-006",
    title: "Kiswahili Dictation",
    description: "Spelling and dictation test",
    assessmentType: "FORMATIVE",
    grade: "Grade 5",
    subject: "Kiswahili",
    term: "Term 1",
    maxScore: 30,
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get("grade")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const searchTerm = searchParams.get("search")

    let filteredAssessments = mockAssessments

    if (grade) {
      filteredAssessments = filteredAssessments.filter(
        (a) => a.grade === grade
      )
    }
    if (type) {
      filteredAssessments = filteredAssessments.filter(
        (a) => a.assessmentType === type
      )
    }
    if (status) {
      filteredAssessments = filteredAssessments.filter(
        (a) => a.status === status
      )
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredAssessments = filteredAssessments.filter(
        (a) =>
          a.title.toLowerCase().includes(termLower) ||
          a.subject.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredAssessments,
    })
  } catch (error) {
    console.error("School assessments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newAssessment: Assessment = {
      id: `asmt-${Date.now().toString(36)}`,
      ...body,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newAssessment,
      message: "Assessment created successfully",
    })
  } catch (error) {
    console.error("Create assessment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create assessment" },
      { status: 500 }
    )
  }
}