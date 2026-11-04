import { NextResponse } from "next/server"

interface User {
  id: string
  name: string
  email: string
  role: string
  institution: string
  wing: "SCHOOL" | "PARISH" | "SHARED"
  status: "ACTIVE" | "INACTIVE"
  lastLogin: string
  createdAt: string
}

interface Role {
  id: string
  name: string
  permissions: string[]
  institution: string
  wing: "SCHOOL" | "PARISH" | "SHARED"
}

interface AuditLog {
  id: string
  action: string
  userId: string
  userName: string
  institutionId: string
  timestamp: string
  resource: string
  details: string
}

interface Institution {
  id: string
  name: string
  type: "SCHOOL" | "PARISH"
  wing: "SCHOOL" | "PARISH" | "SHARED"
  address: string
  phone: string
  status: "ACTIVE" | "INACTIVE"
}

const mockUsers: User[] = [
  {
    id: "usr-001",
    name: "Admin User",
    email: "admin@saintshub.ac.ke",
    role: "Super Admin",
    institution: "All Saints Mushililie Academy",
    wing: "SCHOOL",
    status: "ACTIVE",
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-002",
    name: "Teacher Omondi",
    email: "omondi@saintshub.ac.ke",
    role: "Teacher",
    institution: "All Saints Mushililie Academy",
    wing: "SCHOOL",
    status: "ACTIVE",
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-003",
    name: "Parent Akinyi",
    email: "akinyi@saintshub.ac.ke",
    role: "Parent",
    institution: "All Saints Mushililie Academy",
    wing: "SCHOOL",
    status: "ACTIVE",
    lastLogin: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockRoles: Role[] = [
  {
    id: "rol-001",
    name: "Super Admin",
    permissions: ["*"],
    institution: "All Saints Mushililie Academy",
    wing: "SCHOOL",
  },
  {
    id: "rol-002",
    name: "Principal",
    permissions: ["academics:read", "finance:read", "students:read", "staff:read"],
    institution: "All Saints Mushililie Academy",
    wing: "SCHOOL",
  },
  {
    id: "rol-003",
    name: "Teacher",
    permissions: ["academics:read", "lesson-plans:read", "timetable:read"],
    institution: "All Saints Mushililie Academy",
    wing: "SCHOOL",
  },
  {
    id: "rol-004",
    name: "Parish Coordinator",
    permissions: ["parish:read", "members:read", "events:read"],
    institution: "All Saints Parish",
    wing: "PARISH",
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: "log-001",
    action: "CREATE",
    userId: "usr-001",
    userName: "Admin User",
    institutionId: "inst-school-1",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resource: "User",
    details: "Created new user account",
  },
  {
    id: "log-002",
    action: "CREATE",
    userId: "usr-001",
    userName: "Admin User",
    institutionId: "inst-school-1",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    resource: "Assessment",
    details: "Created Term 1 Mathematics Test",
  },
  {
    id: "log-003",
    action: "UPDATE",
    userId: "usr-002",
    userName: "Teacher Omondi",
    institutionId: "inst-school-1",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    resource: "Student",
    details: "Updated student grades",
  },
]

const mockInstitutions: Institution[] = [
  {
    id: "inst-school-1",
    name: "All Saints Mushililie Academy",
    type: "SCHOOL",
    wing: "SCHOOL",
    address: "Mushililie, Nairobi",
    phone: "+254-700-123-456",
    status: "ACTIVE",
  },
  {
    id: "inst-parish-1",
    name: "All Saints Parish",
    type: "PARISH",
    wing: "PARISH",
    address: "Nairobi CBD",
    phone: "+254-700-987-654",
    status: "ACTIVE",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get("resource")
    const searchTerm = searchParams.get("search")
    const wing = searchParams.get("wing")

    if (resource === "users") {
      let filteredUsers = mockUsers

      if (wing) {
        filteredUsers = filteredUsers.filter((u) => u.wing === wing)
      }

      if (searchTerm) {
        const termLower = searchTerm.toLowerCase()
        filteredUsers = filteredUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(termLower) ||
            u.email.toLowerCase().includes(termLower)
        )
      }

      return NextResponse.json({
        success: true,
        data: filteredUsers,
      })
    }

    if (resource === "roles") {
      let filteredRoles = mockRoles

      if (wing) {
        filteredRoles = filteredRoles.filter((r) => r.wing === wing)
      }

      if (searchTerm) {
        const termLower = searchTerm.toLowerCase()
        filteredRoles = filteredRoles.filter((r) => r.name.toLowerCase().includes(termLower))
      }

      return NextResponse.json({
        success: true,
        data: filteredRoles,
      })
    }

    if (resource === "audit") {
      let filteredLogs = mockAuditLogs

      if (searchTerm) {
        const termLower = searchTerm.toLowerCase()
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.action.toLowerCase().includes(termLower) ||
            log.resource.toLowerCase().includes(termLower) ||
            log.userName.toLowerCase().includes(termLower)
        )
      }

      return NextResponse.json({
        success: true,
        data: filteredLogs,
      })
    }

    if (resource === "institutions") {
      let filteredInstitutions = mockInstitutions

      if (wing) {
        filteredInstitutions = filteredInstitutions.filter((i) => i.wing === wing)
      }

      return NextResponse.json({
        success: true,
        data: filteredInstitutions,
      })
    }

    return NextResponse.json({
      success: true,
      data: [],
    })
  } catch (error) {
    console.error("Admin API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const resource = body.resource

    if (resource === "users") {
      const newUser: User = {
        id: `usr-${Date.now().toString(36)}`,
        name: body.name,
        email: body.email,
        role: body.role || "Teacher",
        institution: body.institution || "All Saints Mushililie Academy",
        wing: body.wing || "SCHOOL",
        status: "ACTIVE",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: newUser,
        message: "User created successfully",
      })
    }

    if (resource === "roles") {
      const newRole: Role = {
        id: `rol-${Date.now().toString(36)}`,
        name: body.name,
        permissions: body.permissions || [],
        institution: body.institution || "All Saints Mushililie Academy",
        wing: body.wing || "SCHOOL",
      }

      return NextResponse.json({
        success: true,
        data: newRole,
        message: "Role created successfully",
      })
    }

    return NextResponse.json(
      { success: false, error: "Unknown resource" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Admin API POST error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create resource" },
      { status: 500 }
    )
  }
}