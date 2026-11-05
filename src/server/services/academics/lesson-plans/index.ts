// ============================================================================
// Lesson Plan Service - SaintsHub School Academics
// ============================================================================
// Provides: Lesson plan creation, retrieval, and management

import { prisma } from "@/server/db"

export interface LessonPlan {
  id: string
  title: string
  description: string
  grade: string
  subject: string
  term: string
  createdAt: Date
  createdBy: string
}

// Get lesson plans
export async function getLessonPlans(
  institutionId: string,
  gradeId?: string,
  subjectId?: string,
  termId?: string
) {
  const where: any = {}

  if (gradeId) {
    where.grade = gradeId
  }

  if (subjectId) {
    where.subject = subjectId
  }

  if (termId) {
    where.term = termId
  }

  return prisma.lessonPlan.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
}

// Create a lesson plan
export async function createLessonPlan(
  data: {
    title: string
    description: string
    grade: string
    subject: string
    term: string
    createdBy: string
  },
  institutionId: string
) {
  return prisma.lessonPlan.create({
    data: {
      ...data,
      institutionId,
    },
  })
}