import { NextResponse } from "next/http"

interface StudentAssignment {
  id: string
  roomId: string
  roomNumber: string
  dormitoryName: string
  studentId: string
  studentName: string
  studentAdmission: string
  grade: string
  leaseStart: string
  leaseEnd: string
  isCurrent: boolean
  rentAmount: number
  daysRemaining: number
  status: "ACTIVE" | "EXPIRED" | "TERMINATED"
  assignedAt: string
  assignedBy: string
}

interface StudentDetails {
  id: string
  studentName: string
  studentAdmission: string
  grade: string
  gender: "MALE" | "FEMALE"
  dateOfBirth: string
  address: string
  contactNumber: string
  emergencyContact: string
  parentGuardianName: string
  parentGuardianContact: string
  religion: string
  nationality: string
  profileImage?: string
}

interface StudentBilling {
  id: string
  feeId: string
  feeName: string
  amount: number
  period: string
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE"
  paidDate?: string
  paymentMethod?: string
  receiptNumber?: string
}

interface StudentProfile {
  student: StudentDetails
  currentAssignment: StudentAssignment | null
  billingHistory: StudentBilling[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") || ""

    // Mock student details data
    const mockStudent: StudentDetails = {
      id: studentId || "std-001",
      studentName: studentId || "John Omondi",
      studentAdmission: studentId || "ADM-2024-001",
      grade: studentId ? "Grade 7" : "Grade 7",
      gender: "MALE",
      dateOfBirth: new Date(Date.now() - 10 * 365 * 86400000).toISOString().split("T")[0],
      address: "Nairobi, Kenya",
      contactNumber: "+254712345678",
      emergencyContact: "+254755555555",
      parentGuardianName: "Joseph Omondi",
      parentGuardianContact: "+254711222333",
      religion: "Anglican",
      nationality: "Kenyan",
    }

    // Mock current assignment
    const mockAssignment: StudentAssignment | null = studentId
      ? {
          id: "sassign-001",
          roomId: "room-001",
          roomNumber: "R-101",
          dormitoryName: "Boys' House",
          studentId: studentId,
          studentName: mockStudent.studentName,
          studentAdmission: mockStudent.studentAdmission,
          grade: mockStudent.grade,
          leaseStart: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          leaseEnd: new Date(Date.now() + 604800000).toISOString().split("T")[0],
          isCurrent: true,
          rentAmount: 50000,
          daysRemaining: 30,
          status: "ACTIVE",
          assignedAt: new Date(Date.now() - 604800000).toISOString(),
          assignedBy: "admin-001",
        }
      : null

    // Mock billing history
    const mockBilling: StudentBilling[] = [
      {
        id: "bill-001",
        feeId: "fee-001",
        feeName: "Full Boarding - Termly",
        amount: 75000,
        period: "Term 1 2024",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "PENDING",
      },
      {
        id: "bill-002",
        feeId: "fee-001",
        feeName: "Full Boarding - Termly",
        amount: 75000,
        period: "Term 2 2024",
        dueDate: new Date().toISOString().split("T")[0],
        status: "PAID",
        paidDate: new Date(Date.now() - 86400000).toISOString(),
        paymentMethod: "M-Pesa STK Push",
        receiptNumber: "REC-2024-001",
      },
    ]

    const studentProfile: StudentProfile = {
      student: mockStudent,
      currentAssignment: mockAssignment,
      billingHistory: mockBilling,
    }

    return NextResponse.json({
      success: true,
      data: studentProfile,
    })
  } catch (error) {
    console.error("Student details error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch student details" },
      { status: 500 }
    )
  }
}