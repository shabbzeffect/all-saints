"use client"

import { useRouter } from "next/navigation"
import { ParentDashboard } from "@/features/parent/ParentDashboard"
import { SAMPLE_CHILDREN } from "@/features/parent/sample-children"

export default function ParentPage() {
  const router = useRouter()
  return <ParentDashboard students={SAMPLE_CHILDREN} onNavigate={(path) => router.push(path)} />
}

