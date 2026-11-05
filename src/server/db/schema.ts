// ============================================================================
// Database Schema - SaintsHub
// ============================================================================
// Prisma schema types and database configuration

import { PrismaClient, GradeLevel, ClubType, KPSEAType, KJSEAType, AssessmentType, AssessmentScoreBand, DisciplineCategory, DisciplineAction, ClubMemberType } from "@prisma/client"

// Export types for use in API routes
export type { PrismaClient }

export const enum GradeLevelValues {
  Grade1 = "Grade 1",
  Grade2 = "Grade 2",
  Grade3 = "Grade 3",
  Grade4 = "Grade 4",
  Grade5 = "Grade 5",
  Grade6 = "Grade 6",
  Grade7 = "Grade 7",
  Grade8 = "Grade 8",
  Grade9 = "Grade 9",
  Grade10 = "Grade 10",
}

export const enum ClubTypeValues {
  Curricular = "curricular",
  Extracurricular = "extracurricular",
  House = "house",
}

export const enum KPSEATypeValues {
  KPSEA = "KPSEA",
  KJSEA = "KJSEA",
}

export const enum AssessmentTypeValues {
  Formative = "FORMATIVE",
  Summative = "SUMMATIVE",
  SBA = "SBA",
}

export const enum AssessmentScoreBandValues {
  Excellent = "Excellent",
  Good = "Good",
  Satisfactory = "Satisfactory",
  NeedsImprovement = "Needs Improvement",
  Poor = "Poor",
}

export const enum DisciplineCategoryValues {
  Academic = "Academic",
  Behavioral = "Behavioral",
  Attendance = "Attendance",
}

export const enum DisciplineActionValues {
  Warning = "Warning",
  Suspension = "Suspension",
  Expulsion = "Expulsion",
}

export type ClubMemberRole = "president" | "vice-president" | "secretary" | "treasurer" | "member"