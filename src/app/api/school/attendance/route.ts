import { NextResponse } from "next/http"

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  period: string
  subject: string
}

interface AttendanceSummary {
  studentId: string
  studentName: string
  admissionNumber: string
  grade: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  attendancePercentage: number
}

interface AttendanceFilter {
  studentId?: string
  grade?: string
  startDate?: string
  endDate?: string
  status?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get("institutionId") || "inst-school-1"
    const studentId = searchParams.get("studentId")
    const grade = searchParams.get("grade")
    const status = searchParams.get("status")

    // Mock attendance data
    const mockRecords: AttendanceRecord[] = [
      {
        id: "att-001",
        studentId: "std-001",
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-001",
        grade: "Grade 7",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        status: "PRESENT",
        period: "Period 1",
        subject: "Mathematics",
      },
      {
        id: "att-002",
        studentId: "std-001",
        studentName: "Jane Doe",
        admissionNumber: "ADM-2024-001",
        grade: "Grade 7",
        date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
        status: "ABSENT",
        period: "Period 2",
        subject: "English",
      },
      {
        id: "att-003",
        studentId: "std-002",
        studentName: "John Smith",
        admissionNumber: "ADM-2024-002",
        grade: "Grade 7",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        status: "LATE",
        period: "Period 1",
        subject: "Mathematics",
      },
    ]

    let filteredRecords = mockRecords

    if (studentId) {
      filteredRecords = mockRecords.filter((r) => r.studentId === studentId)
    }
    if (grade) {
      filteredRecords = mockRecords.filter((r) => r.grade === grade)
    }
    if (status) {
      filteredRecords = mockRecords.filter((r) => r.status === status)
    }

    // Calculate summary
    const summary = filteredRecords.reduce(
      (acc, record) => {
        acc.totalDays++
        if (record.status === "PRESENT") acc.presentDays++
        if (record.status === "ABSENT") acc.absentDays++
        if (record.status === "LATE") acc.lateDays++
        return acc
      },
      { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0 }
    )

    summary.attendancePercentage =
      summary.totalDays > 0
        ? Math.round((summary.presentDays / summary.totalDays) * 100)
        : 0

    return NextResponse.json({
      success: true,
      data: {
        records: filteredRecords,
        summary,
      },
    })
  } catch (error) {
    console.error("School attendance error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, date, status, period, subject } = body

    // Record attendance
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now().toString(36)}`,
      studentId,
      studentName: "", // Would fetch from DB
      admissionNumber: "",
      grade: "",
      date: date,
      status: status,
      period,
      subject,
    }

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: "Attendance recorded successfully",
    })
  } catch (error) {
    console.error("Record attendance error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record attendance" },
      { status: 500 }
    )
  }
}