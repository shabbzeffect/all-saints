import { NextResponse } from "next/http"

interface AdmissionApplication {
  id: string
  studentName: string
  admissionNumber: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  gradeApply: string
  stream?: string
  previousSchool: string
  contactName: string
  contactPhone: string
  contactEmail: string
  currentGrade: string
  religion: string
  status: "PENDING" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED"
  appliedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

interface AdmissionSearch {
  grade?: string
  status?: string
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || "inst-school-1"
    const grade = searchParams.get("grade")
    const status = searchParams.get("status")
    const searchTerm = searchParams.get("search")

    // Mock admission applications
    const mockApplications: AdmissionApplication[] = [
      {
        id: "adm-001",
        studentName: "Alice Wang",
        admissionNumber: "ADM-2024-010",
        dateOfBirth: "2016-03-15",
        gender: "FEMALE",
        gradeApply: "Grade 1",
        stream: "Stream A",
        previousSchool: "Bright Future Academy",
        contactName: "Robert Wang",
        contactPhone: "+254712345678",
        contactEmail: "robert.wang@email.com",
        currentGrade: "PP2",
        religion: "Christian",
        status: "ACCEPTED",
        appliedAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: "adm-002",
        studentName: "Brian Okoro",
        admissionNumber: "ADM-2024-011",
        dateOfBirth: "2017-08-22",
        gender: "MALE",
        gradeApply: "Grade 3",
        previousSchool: "Star of Hope School",
        contactName: "Michael Okoro",
        contactPhone: "+254723456789",
        contactEmail: "m.okoro@email.com",
        currentGrade: "Grade 2",
        religion: "Muslim",
        status: "UNDER_REVIEW",
        appliedAt: new Date(Date.now() - 1209600000).toISOString(),
      },
      {
        id: "adm-003",
        studentName: "Carol Chebet",
        admissionNumber: "ADM-2024-012",
        dateOfBirth: "2015-11-10",
        gender: "FEMALE",
        gradeApply: "Grade 7",
        previousSchool: "Nairobi Primary School",
        contactName: "Peter Chebet",
        contactPhone: "+254734567890",
        contactEmail: "p.chebet@email.com",
        currentGrade: "Grade 6",
        religion: "Christian",
        status: "PENDING",
        appliedAt: new Date(Date.now() - 1814400000).toISOString(),
      },
    ]

    let filteredApps = mockApplications

    if (grade) {
      filteredApps = filteredApps.filter((a) => a.gradeApply === grade)
    }
    if (status) {
      filteredApps = filteredApps.filter((a) => a.status === status)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredApps = filteredApps.filter(
        (a) =>
          a.studentName.toLowerCase().includes(termLower) ||
          a.admissionNumber.toLowerCase().includes(termLower) ||
          a.contactEmail.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredApps,
    })
  } catch (error) {
    console.error("School admissions error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch admissions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new admission application
    const newApplication: AdmissionApplication = {
      id: `adm-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      appliedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: "Admission application submitted successfully",
    })
  } catch (error) {
    console.error("Create admission error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit admission application" },
      { status: 500 }
    )
  }
}