/* lesson-plans.service.ts
 * Lesson Plans Service - SaintsHub
 * Provides: Daily lesson planning, curriculum alignment, resource sharing
 */

interface LessonPlan {
  id: string
  title: string
  subject: string
  grade: string
  term: string
  week: number
  objectives: string[]
  activities: string[]
  assessment: string
  resources: string[]
  status: "draft" | "published" | "archived"
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface LessonPlanSearch {
  subject?: string
  grade?: string
  term?: string
  status?: "draft" | "published" | "archived"
}

export class LessonPlansService {
  private static plans: LessonPlan[] = []

  static async listPlans(filters?: LessonPlanSearch): Promise<LessonPlan[]> {
    let result = [...this.plans]
    if (filters?.subject) {
      result = result.filter((p) => p.subject === filters.subject)
    }
    if (filters?.grade) {
      result = result.filter((p) => p.grade === filters.grade)
    }
    if (filters?.term) {
      result = result.filter((p) => p.term === filters.term)
    }
    if (filters?.status) {
      result = result.filter((p) => p.status === filters.status)
    }
    return result.sort((a, b) => b.week - a.week)
  }

  static async getPlan(id: string): Promise<LessonPlan | null> {
    const plan = this.plans.find((p) => p.id === id)
    return plan || null
  }

  static async createPlan(plan: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">): Promise<LessonPlan> {
    const now = new Date().toISOString()
    const newPlan: LessonPlan = {
      id: generateId(12),
      ...plan,
      createdAt: now,
      updatedAt: now,
      status: "draft",
    }
    this.plans.push(newPlan)
    return newPlan
  }

  static async updatePlan(
    id: string,
    updates: Partial<Omit<LessonPlan, "id" | "createdAt" | "updatedAt">>
  ): Promise<LessonPlan | null> {
    const index = this.plans.findIndex((p) => p.id === id)
    if (index === -1) return null
    this.plans[index] = { ...this.plans[index], ...updates, updatedAt: new Date().toISOString() }
    return this.plans[index]
  }

  static async deletePlan(id: string): Promise<boolean> {
    const index = this.plans.findIndex((p) => p.id === id)
    if (index === -1) return false
    this.plans.splice(index, 1)
    return true
  }

  static async publishPlan(id: string): Promise<LessonPlan | null> {
    const index = this.plans.findIndex((p) => p.id === id)
    if (index === -1) return null
    this.plans[index].status = "published"
    this.plans[index].updatedAt = new Date().toISOString()
    return this.plans[index]
  }

  static async searchPlans(
    query: string,
    filters?: LessonPlanSearch
  ): Promise<LessonPlan[]> {
    const all = this.listPlans(filters)
    return all.filter(
      (plan) =>
        plan.title.toLowerCase().includes(query.toLowerCase()) ||
        plan.subject.toLowerCase().includes(query.toLowerCase()) ||
        plan.objectives.some((obj) => obj.toLowerCase().includes(query.toLowerCase()))
    )
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