import { PortalShell } from "@/components/layout/PortalShell"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>
}
