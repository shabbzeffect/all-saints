import { NextResponse } from "next/http"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get("details") === "true"

    const healthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      environment: process.env.NODE_ENV || "development",
    }

    if (includeDetails) {
      healthData.details = {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      }
    }

    return NextResponse.json({ success: true, data: healthData })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Health check failed" },
      { status: 500 }
    )
  }
}