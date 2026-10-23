/* discipline.service.ts
 * School Discipline Service - SaintsHub
 * Provides: Discipline records, sanctions, restoration, history
 */

interface DisciplineRecord {
  id: string
  studentId: string
  admissionNumber: string
  fullName: string
  grade: string
  incidentDescription: string
  incidentDate: string
  reportedBy: string
  severity: "minor" | "major" | "critical"
  status: "pending" | "investigating" | "resolved" "archived"
  sanctions: string[]
  resolvedAt: string | null
  resolutionNotes: string | null
}

interface Sanction {
  id: string
  recordId: string
  type: "warning" | "detention" | "suspension" | "expulsion" | "community-service"
  description: string
  dateIssued: string
  duration?: string
  imposedBy: string
  status: "active" | "completed" | "voided"
}

export class DisciplineService {
  private static records: DisciplineRecord[] = []
  private static sanctions: Sanction[] = []

  static async recordIncident(
    studentId: string,
    admissionNumber: string,
    fullName: string,
    grade: string,
    incidentDescription: string,
    reportedBy: string,
    severity: "minor" | "major" | "critical"
  ): Promise<DisciplineRecord> {
    const record: DisciplineRecord = {
      id: generateId(12),
      studentId,
      admissionNumber,
      fullName,
      grade,
      incidentDescription,
      incidentDate: new Date().toISOString(),
      reportedBy,
      severity,
      status: "pending",
      sanctions: [],
      resolvedAt: null,
      resolutionNotes: null,
    }
    this.records.push(record)
    return record
  }

  static async getRecord(id: string): Promise<DisciplineRecord | null> {
    const record = this.records.find((r) => r.id === id)
    return record || null
  }

  static async getStudentRecords(studentId: string): Promise<DisciplineRecord[]> {
    return this.records.filter((r) => r.studentId === studentId)
  }

  static async updateStatus(
    id: string,
    status: "pending" | "investigating" | "resolved" | "archived"
  ): Promise<DisciplineRecord | null> {
    const index = this.records.findIndex((r) => r.id === id)
    if (index === -1) return null
    this.records[index].status = status
    if (status === "resolved") {
      this.records[index].resolvedAt = new Date().toISOString()
    }
    return this.records[index]
  }

  static async addSanction(
    recordId: string,
    sanction: Omit<Sanction, "id">
  ): Promise<Sanction | null> {
    const record = this.records.find((r) => r.id === recordId)
    if (!record) return null

    const sanctionWithId: Sanction = {
      id: generateId(12),
      ...sanction,
      dateIssued: new Date().toISOString(),
      status: "active",
    }
    this.sanctions.push(sanctionWithId)
    record.sanctions.push(sanctionWithId.id)
    return sanctionWithId
  }

  static async resolveRecord(
    id: string,
    notes: string
  ): Promise<DisciplineRecord | null> {
    const index = this.records.findIndex((r) => r.id === id)
    if (index === -1) return null
    this.records[index].status = "resolved"
    this.records[index].resolvedAt = new Date().toISOString()
    this.records[index].resolutionNotes = notes
    return this.records[index]
  }

  static async listRecords(filters?: {
    severity?: "minor" | "major" | "critical"
    status?: "pending" | "investigating" | "resolved" | "archived"
    grade?: string
  }): Promise<DisciplineRecord[]> {
    let result = [...this.records]
    if (filters?.severity) {
      result = result.filter((r) => r.severity === filters.severity)
    }
    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status)
    }
    if (filters?.grade) {
      result = result.filter((r) => r.grade === filters.grade)
    }
    return result
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