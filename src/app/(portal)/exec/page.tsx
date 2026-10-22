/* Executive Dashboard - SaintsHub
Provides: role-aware dashboard with separate school and parish KPIs
*/
import { cn } from "@/lib/config"
import { Card, Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Revenue, Users, BuildingHouse, Calendar, Heart, GraduationCap, Shield, Mail, Phone } from "lucide-react"
import { useSearchParams, useSearchParamsProtocol } from "next/navigation"
import { useEffect, useState } from "react"

export function ExecDashboard() {
  const searchParams = useSearchParams()
  const institution = searchParams.get("institution") as "school" | "parish" | null
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch KPIs based on institution
    // In production, this would be API calls
    const mockKPIs = institution === "school" ? {
      title: "School KPIs",
      metrics: [
        { label: "Enrolled Students", value: "427", icon: GraduationCap },
        { label: "Active Teachers", value: "28", icon: Users },
        { label: "Fee Collection Rate", value: "85%", icon: Heart },
        { label: "Available Seats", value: "156", icon: BuildingHouse },
      ],
    } : {
      title: "Parish KPIs",
      metrics: [
        { label: "Active Members", value: "312", icon: Users },
        { label: "Weekly Offerings", value: "KSh 450,000", icon: Heart },
        { label: "Project Progress", value: "67%", icon: BuildingHouse },
        { label: "New Baptisms", value: "12", icon: GraduationCap },
      ],
    }

    const schoolKPIs = institution === "school" ? mockKPIs.school : null
    const parishKPIs = institution === "parish" ? mockKPIs.parish : null

    setKpis(institution === "school" ? schoolKPIs! : parishKPIs!)
    setLoading(false)
  }, [institution])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <span className="text-muted-foreground">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {institution === "school"
          ? "School Executive Dashboard"
          : institution === "parish"
          ? "Parish Executive Dashboard"
          : "SaintsHub Executive Dashboard"}
      </h1>

      {institution && <p className="text-muted-foreground mb-6">
        Viewing: {" "}
        {institution === "school" ? "School" : "Parish"} {" "}
        KPIs
      </p>}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <kpi.icon
                  className="h-6 w-6 text-primary flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-lg font-medium">{kpi.value}</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary/10 text-primary">
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Section: Recent Activity */}
      <div className="grid max-w-7xl mx-auto gap-6">
        {/* Recent data would go here */}
      </div>
    </div>
  )
}