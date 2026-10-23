/* clubs.service.ts
 * School Clubs Service - SaintsHub
 * Provides: Club management, membership, events, achievements
 */

interface Club {
  id: string
  name: string
  description: string
  category: "academic" | "sports" | "arts" | "cultural" | "special-interest"
  gradeLevels: string[]
  sponsorTeacher: string
  meetingSchedule: string
  maxMembers: number
  currentMembers: number
  status: "active" | "inactive" | "archived"
  founded: string
  meetingLocation: string
}

interface ClubMember {
  id: string
  studentId: string
  admissionNumber: string
  fullName: string
  grade: string
  joinedAt: string
  role: "member" | "officer" | "founder"
}

export class ClubsService {
  private static clubs: Club[] = []
  private static members: ClubMember[] = []

  static async listClubs(filters?: {
    category?: string
    status?: string
    gradeLevel?: string
  }): Promise<Club[]> {
    let result = [...this.clubs]
    if (filters?.category) {
      result = result.filter((c) => c.category === filters.category)
    }
    if (filters?.status) {
      result = result.filter((c) => c.status === filters.status)
    }
    if (filters?.gradeLevel) {
      result = result.filter((c) => c.gradeLevels.includes(filters.gradeLevel))
    }
    return result
  }

  static async getClub(id: string): Promise<Club | null> {
    const club = this.clubs.find((c) => c.id === id)
    return club || null
  }

  static async createClub(club: Omit<Club, "id">): Promise<Club> {
    const id = generateId(12)
    const newClub: Club = { ...club, id }
    this.clubs.push(newClub)
    return newClub
  }

  static async updateClub(
    id: string,
    updates: Partial<Omit<Club, "id">>
  ): Promise<Club | null> {
    const index = this.clubs.findIndex((c) => c.id === id)
    if (index === -1) return null
    this.clubs[index] = { ...this.clubs[index], ...updates }
    return this.clubs[index]
  }

  static async deleteClub(id: string): Promise<boolean> {
    const index = this.clubs.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.clubs.splice(index, 1)
    return true
  }

  static async addMember(clubId: string, studentId: string): Promise<ClubMember | null> {
    const club = this.clubs.find((c) => c.id === clubId)
    if (!club) return null

    const exists = this.members.find(
      (m) => m.studentId === studentId && m.clubId === clubId
    )
    if (exists) return null

    const member: ClubMember = {
      id: generateId(12),
      studentId,
      admissionNumber: "",
      fullName: "",
      grade: "",
      joinedAt: new Date().toISOString(),
      role: "member",
    }
    this.members.push(member)
    return member
  }

  static async removeMember(clubId: string, studentId: string): Promise<boolean> {
    const index = this.members.findIndex(
      (m) => m.studentId === studentId && m.clubId === clubId
    )
    if (index === -1) return false
    this.members.splice(index, 1)
    return true
  }

  static async listMembers(clubId: string): Promise<ClubMember[]> {
    return this.members.filter((m) => m.clubId === clubId)
  }
}

function generateId(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}