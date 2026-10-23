import { NextResponse } from "next/http"

interface Document {
  id: string
  name: string
  type: "SYLLABUS" | "TEXTBOOK" | "REFERENCE" | "PERMISSION_FORM" | "REPORT_CARD" | "OTHER"
  description: string
  uploader: string
  uploadedAt: string
  fileUrl: string
  fileSize: number
  downloadCount: number
  wing: "SCHOOL" | "PARISH"
  applicableGrades: string[]
}

interface DocumentFilter {
  type?: "SYLLABUS" | "TEXTBOOK" | "REFERENCE" | "PERMISSION_FORM" | "REPORT_CARD" | "OTHER"
  wing?: "SCHOOL" | "PARISH"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wing = searchParams.get("wing") as "SCHOOL" | "PARISH" || "SCHOOL"
    const type = searchParams.get("type") as "SYLLABUS" | "TEXTBOOK" | "REFERENCE" | "PERMISSION_FORM" | "REPORT_CARD" | "OTHER" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock documents
    const mockDocuments: Document[] = [
      {
        id: "doc-001",
        name: "Grade 1 Syllabus 2024",
        type: "SYLLABUS",
        description: "Term 1 syllabus for Grade 1 - Mathematics",
        uploader: "Mr. Joseph Omondi",
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        fileUrl: "/documents/syllabus-grade-1-term1.pdf",
        fileSize: 1024000,
        downloadCount: 45,
        wing: "SCHOOL",
        applicableGrades: ["Grade 1"],
      },
      {
        id: "doc-002",
        name: "School Calendar 2024",
        type: "SYLLABUS",
        description: "Academic calendar for 2024 showing terms, holidays, and events",
        uploader: "Mrs. Jane Awuor",
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        fileUrl: "/documents/school-calendar-2024.pdf",
        fileSize: 2048000,
        downloadCount: 120,
        wing: "SCHOOL",
        applicableGrades: [],
      },
      {
        id: "doc-003",
        name: "KPSEA Preparation Guide",
        type: "REFERENCE",
        description: "Guide for KPSEA examination preparation",
        uploader: "Mr. Joseph Omondi",
        uploadedAt: new Date(Date.now() - 259200000).toISOString(),
        fileUrl: "/documents/kpsea-prep-guide.pdf",
        fileSize: 512000,
        downloadCount: 30,
        wing: "SCHOOL",
        applicableGrades: ["Grade 6", "Grade 7", "Grade 8"],
      },
      {
        id: "doc-004",
        name: "Parent Consent Form",
        type: "PERMISSION_FORM",
        description: "General permission form for school activities and trips",
        uploader: "School Administration",
        uploadedAt: new Date(Date.now() - 604800000).toISOString(),
        fileUrl: "/documents/parent-consent-form.pdf",
        fileSize: 256000,
        downloadCount: 200,
        wing: "SCHOOL",
        applicableGrades: [],
      },
    ]

    let filteredDocs = mockDocuments

    if (wing) {
      filteredDocs = filteredDocs.filter((d) => d.wing === wing)
    }
    if (type) {
      filteredDocs = filteredDocs.filter((d) => d.type === type)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredDocs = filteredDocs.filter(
        (d) => d.name.toLowerCase().includes(termLower) || d.description.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredDocs,
    })
  } catch (error) {
    console.error("Shared documents error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Upload new document
    const newDocument: Document = {
      id: `doc-${Date.now().toString(36)}`,
      ...body,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
    }

    return NextResponse.json({
      success: true,
      data: newDocument,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Upload document error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    )
  }
}