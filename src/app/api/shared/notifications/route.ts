import { NextResponse } from "next/http"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH"
  recipientType: "STAFF" | "PARENTS" | "STUDENTS" | "MEMBERS" | "ALL"
  recipientId?: string
  institutionId?: string
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED"
  sentAt?: string
  deliveredAt?: string
  createdAt: string
  metadata?: {
    read?: boolean
    clicked?: boolean
  }
}

interface NotificationFilter {
  status?: "PENDING" | "SENT" | "DELIVERED" | "FAILED"
  channel?: "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH"
  recipientType?: "STAFF" | "PARENTS" | "STUDENTS" | "MEMBERS" | "ALL"
  type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  searchTerm?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "PENDING" | "SENT" | "DELIVERED" | "FAILED" || undefined
    const channel = searchParams.get("channel") as "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH" || undefined
    const recipientType = searchParams.get("recipientType") as "STAFF" | "PARENTS" | "STUDENTS" | "MEMBERS" | "ALL" || undefined
    const type = searchParams.get("type") as "INFO" | "WARNING" | "SUCCESS" | "ERROR" || undefined
    const searchTerm = searchParams.get("search") || ""

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "notif-001",
        title: "Term 1 Report Cards Available",
        message: "Report cards for Term 1 are now available for download in the parent portal.",
        type: "INFO",
        channel: "IN_APP",
        recipientType: "PARENTS",
        institutionId: "inst-school-1",
        status: "DELIVERED",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "notif-002",
        title: "School Closed - Holiday",
        message: "School will be closed for the December holidays from December 20th to January 5th.",
        type: "INFO",
        channel: "EMAIL",
        recipientType: "ALL",
        status: "SENT",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "notif-003",
        title: "Fee Payment Reminder",
        message: "Please note that fee payments are due by the 1st of each month. Late payments will attract a 5% penalty.",
        type: "WARNING",
        channel: "SMS",
        recipientType: "PARENTS",
        status: "PENDING",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: "notif-004",
        title: "Exam Schedule Published",
        message: "The end of term examination schedule has been published. Please check the academic calendar.",
        type: "SUCCESS",
        channel: "IN_APP",
        recipientType: "STUDENTS",
        status: "DELIVERED",
        createdAt: new Date(Date.now() - 345600000).toISOString(),
      },
    ]

    let filteredNotifs = mockNotifications

    if (status) {
      filteredNotifs = filteredNotifs.filter((n) => n.status === status)
    }
    if (channel) {
      filteredNotifs = filteredNotifs.filter((n) => n.channel === channel)
    }
    if (recipientType) {
      filteredNotifs = filteredNotifs.filter((n) => n.recipientType === recipientType)
    }
    if (type) {
      filteredNotifs = filteredNotifs.filter((n) => n.type === type)
    }
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase()
      filteredNotifs = filteredNotifs.filter(
        (n) => n.title.toLowerCase().includes(termLower) || n.message.toLowerCase().includes(termLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredNotifs,
    })
  } catch (error) {
    console.error("Shared notifications error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new notification
    const newNotification: Notification = {
      id: `notif-${Date.now().toString(36)}`,
      ...body,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: "Notification created successfully",
    })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    )
  }
}