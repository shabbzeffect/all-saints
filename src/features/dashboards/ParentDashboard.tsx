/* Parent Dashboard - SaintsHub Parent Portal
Provides: Key metrics overview for parents/guardians
*/
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

interface ParentMetric {
  title: string
  value: string
  subtitle: string
  variant: "default" | "secondary" | "destructive" | "success"
  icon?: string
  href?: string
}

interface ParentDashboardProps {
  children: any[]
  onNavigate: (path: string) => void
}

export function ParentDashboard({ children, onNavigate }: ParentDashboardProps) {
  const [metrics, setMetrics] = useState<ParentMetric[]>([])
  const [feeSummary, setFeeSummary] = useState({ total: 0, paid: 0, outstanding: 0 })
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize from URL if needed
  useEffect(() => {
    setMetrics([
      {
        title: "Children",
        value: children.length > 0 ? children.length.toString() : "0",
        subtitle: "Children linked to account",
        variant: "default",
        icon: "Users",
        href: "/parent",
      },
      {
        title: "Outstanding Balance",
        value: "KSh 0",
        subtitle: "Fees due this term",
        variant: "destructive",
        icon: "AlertCircle",
        href: "/parent/pay-fees",
      },
      {
        title: "Payments This Term",
        value: "0",
        subtitle: "Payments recorded",
        variant: "default",
        icon: "ShoppingCart",
        href: "/parent/pay-fees",
      },
    ])
  }, [children])

  useEffect(() => {
    // Fetch parent-specific data
    const fetchParentData = async () => {
      // In a real app, would fetch from API
      const mockMetrics: ParentMetric[] = [
        {
          title: "Children",
          value: "3",
          subtitle: "Children linked to account",
          variant: "default",
          icon: "Users",
          href: "/parent",
        },
        {
          title: "Outstanding Balance",
          value: "KSh 18,500",
          subtitle: "Fees due this term",
          variant: "destructive",
          icon: "AlertCircle",
          href: "/parent/pay-fees",
        },
        {
          title: "Payments This Term",
          value: "2",
          subtitle: "Payments recorded",
          variant: "success",
          icon: "ShoppingCart",
          href: "/parent/pay-fees",
        },
      ]
      setMetrics(mockMetrics)
      
      // Fetch fee summary
      setFeeSummary({ total: 50000, paid: 31500, outstanding: 18500 })
    }

    fetchParentData()
  }, [])

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Parent Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Your children's academic & financial overview
        </p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-angle/5 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-anglican-blue font-medium text-sm">{metric.title}</p>
                <p className="text-2xl font-bold {metric.variant === "success" ? "text-success" : metric.variant === "destructive" ? "text-destructive" : "text-anglican-blue"}">
                  {metric.value}
                </p>
                <p className="text-sm text-muted/60 {metric.variant === "success" ? "text-success" : metric.variant === "destructive" ? "text-destructive" : "text-muted/60"}">
                  {metric.subtitle}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fee Summary Card */}
      <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg mb-6">
        <CardHeader>
          <CardTitle>Fee Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-anglican-blue font-medium">Outstanding</p>
              <p className="font-bold text-2xl text-destructive">
                KSh {feeSummary.outstanding.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted/60">Paid</p>
              <p className="font-medium">
                KSh {feeSummary.paid.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-dark/30">
            <p className="text-anglican-blue font-medium">Total</p>
            <p className="font-bold">
              KSh {feeSummary.total.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg" onClick={() => onNavigate("/parent/pay-fees")}>
          <CardHeader>
            <CardTitle>Pay Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-anglican-blue font-medium">Manage fee payments</p>
            <p className="text-sm text-muted/60">M-Pesa & bank transfer</p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg" onClick={() => onNavigate("/parent/receipts")}>
          <CardHeader>
            <CardTitle>Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-anglican-blue font-medium">View payment receipts</p>
            <p className="text-sm text-muted/60">Download & acknowledge</p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg" onClick={() => onNavigate("/parent/report-cards")}>
          <CardHeader>
            <CardTitle>Report Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-anglican-blue font-medium">Academic reports</p>
            <p className="text-sm text-muted/60">View & acknowledge</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}