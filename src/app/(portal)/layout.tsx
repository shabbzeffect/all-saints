import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout title="SaintsHub">{children}</DashboardLayout>
}