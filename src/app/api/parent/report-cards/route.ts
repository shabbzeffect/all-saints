import { NextResponse } from "next/http"

interface ReportCard {
  id: string
  term: string
  academicYear: string
  issueDate: string
  overallGrade: string
  overallScore: number
  subjects: {
    name: string
    grade: string
    score: number
  }[]
  studentName: string
  admissionNumber: string
  downloaded: boolean
  parentAcknowledged: boolean
}

interface ReportCardsResponse {
  reportCards: ReportCard[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || "inst-school-1"
    const studentId = searchParams.get("studentId")

    // Mock report cards data - in a real app, this would fetch from database
    const mockReportCards: ReportCard[] = [
      {
        id: "rc-001",
        term: "Term 1",
        academicYear: "2024",
        issueDate: new Date(Date.now() - 86400000).toISOString(),
        overallGrade: "A",
        overallScore: 85,
        subjects: [
          { name: "Mathematics", grade: "A", score: 92 },
          { name: "English", grade: "B", score: 78 },
          { name: "Swahili", grade: "A", score: 88 },
          { name: "Science", grade: "A", score: 90 },
        ],
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-001",
        downloaded: true,
        parentAcknowledged: true,
      },
      {
        id: "rc-002",
        term: "Term 2",
        academicYear: "2024",
        issueDate: new Date(Date.now() - 172800000).toISOString(),
        overallGrade: "B+",
        overallScore: 72,
        subjects: [
          { name: "Mathematics", grade: "B", score: 75 },
          { name: "English", grade: "B+", score: 70 },
          { name: "Swahili", grade: "A", score: 85 },
          { name: "Science", grade: "B+", score: 78 },
        ],
        studentName: "John Smith",
        admissionNumber: "ADM-2024-002",
        downloaded: false,
        parentAcknowledged: false,
      },
    ]

    let filteredCards = mockReportCards

    if (studentId) {
      filteredCards = mockReportCards.filter(
        (card) => card.admissionNumber === studentId || card.studentName.includes(studentId)
      )
    }

    return NextResponse.json({ success: true, data: filteredCards })
  } catch (error) {
    console.error("Parent report-cards error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch report cards" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { receiptId, reportId } = await request.json()

    // Acknowledge report card
    return NextResponse.json({
      success: true,
      data: { parentAcknowledged: true },
    })
  } catch (error) {
    console.error("Acknowledge report card error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to acknowledge report card" },
      { status: 500 }
    )
  }
}