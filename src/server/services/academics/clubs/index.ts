// ============================================================================
// Clubs Service - SaintsHub School Academics
// ============================================================================
// Provides: Club creation, retrieval, and member management

import { prisma } from "@/server/db"

export interface Club {
  id: string
  name: string
  description: string
  grade: string
  subject: string
  term: string
  createdAt: Date
  createdBy: string
  memberCount: number
}

// Get clubs
export async function getClubs(
  institutionId: string,
  grade?: string,
  subject?: string
) {
  const where: any = {}

  if (grade) {
    where.grade = grade
  }

  if (subject) {
    where.subject = subject
  }

  return prisma.club.findMany({
    where,
    orderBy: { name: "asc" },
  })
}

// Create a club
export async function createClub(
  data: {
    name: string
    description: string
    grade: string
    subject: string
    term: string
    createdBy: string
  },
  institutionId: string
) {
  return prisma.club.create({
    data: {
      ...data,
      institutionId,
    },
  })
}