"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ParentDashboard } from "@/features/parent/ParentDashboard"
import type { StudentSummary } from "@/features/parent/types"
import { Card } from "@/components/ui/card"
import { TableSkeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

export default function ParentPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/parent/children", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.success) throw new Error(body?.error ?? "Request failed")
      setStudents(body.data?.students ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your children")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Parent Portal</h2>
          <p className="text-sm text-muted-foreground">Fee management, attendance and academic records for your children</p>
        </div>
        <TableSkeleton columns={6} rows={3} />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="font-medium text-destructive">Could not load the parent portal</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </Card>
    )
  }

  return <ParentDashboard students={students} onNavigate={(path) => router.push(path)} />
}
