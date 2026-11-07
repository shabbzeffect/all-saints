/* Sample children — used by the parent portal until SIS-backed
 * parent/guardian linkage is available.
 */
export interface StudentSummary {
  id: string
  admissionNumber: string
  fullName: string
  grade: string
  attendancePercentage: number
  feeBalance: number
  isBoarding: boolean
}

export const SAMPLE_CHILDREN: StudentSummary[] = [
  {
    id: "stu-001",
    admissionNumber: "STD-2024-001",
    fullName: "Adeline Akinyi",
    grade: "Grade 3",
    attendancePercentage: 92,
    feeBalance: 15000,
    isBoarding: false,
  },
  {
    id: "stu-002",
    admissionNumber: "STD-2024-002",
    fullName: "Brian Ochieng",
    grade: "Grade 7",
    attendancePercentage: 88,
    feeBalance: 22000,
    isBoarding: true,
  },
  {
    id: "stu-003",
    admissionNumber: "STD-2024-003",
    fullName: "Christine Moraa",
    grade: "Grade 1",
    attendancePercentage: 95,
    feeBalance: 8000,
    isBoarding: false,
  },
]
