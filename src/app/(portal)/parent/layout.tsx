/* Parent Portal Layout - SaintsHub
Provides: mobile-friendly wrapper for parent/guardian portal
Shows: children linked to guardian, quick access to fees/receipts/reports
*/
import { Inter } from "next/font/google"
import { cn } from "@/lib/config"
import Link from "next/link"
import { BuildingHouse, Menu } from "lucide-react"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

const inter = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"] })

interface ParentLayoutProps {
  children: React.ReactNode
  title: string
}

export function ParentLayout({ children, title }: ParentLayoutProps) {
  const [activeInstitution, setActiveInstitution] = useState<"school" | "parish" | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlInstitution = searchParams.get("institution") as "school" | "parish" | null
    if (urlInstitution) {
      setActiveInstitution(urlInstitution)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Inter
        id="inter-parent"
        weight="400"
        display="swap"
        className="antialiased"
      />

      {/* Parent Header/Breadcrumb */}
      <header className="border-b border-border bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeInstitution === "school" && (
              <div className="flex items-center gap-2">
                <BuildingHouse className="h-5 w-5 text-anglican-blue" />
                <span className="font-medium text-anglican-blue">SaintsHub School</span>
              </div>
            )}
            {activeInstitution === "parish" && (
              <div className="flex items-center gap-2">
                <BuildingHouse className="h-5 w-5 text-anglican-purple" />
                <span className="font-medium text-anglican-purple">SaintsHub Parish</span>
              </div>
            )}
            {activeInstitution === null && (
              <div className="flex items-center gap-2">
                <BuildingHouse className="h-5 w-5 text-anglican-blue" />
                <span className="font-medium text-anglican-blue">SaintsHub School</span>
                <BuildingHouse className="h-5 w-5 text-anglican-purple" />
                <span className="font-medium text-anglican-purple">Parish</span>
              </div>
            )}
          </div>

          <h1 className="text-xl font-semibold text-anglican-blue dark:text-anglican-blue-100">
            {title}
          </h1>

          {/* User info */}
          <div className="flex items-center gap-2 text-sm text-muted/60">
            <span>Guardian</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-12 max-w-2xl mx-auto w-full p-4 sm:p-6">
        {children}
      </main>

      {/* Bottom navigation for mobile */}
      <footer className="border-t border-border bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm pt-4 fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <a
            href="/parent"
            className="flex items-center gap-2 text-anglican-blue hover:text-anglican-blue-600 transition-colors"
          >
            <Menu className="h-5 w-5" />
            Dashboard
          </a>

          <a
            href="/parent/pay-fees"
            className="flex items-center gap-2 text-anglican-blue hover:text-anglican-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 9a7 7 0 1112.42 2.6L2 9zm9.34-5.3a.75.75 0 011.06.225L13.38 7H6.62a.75.75 0 01-.75-.75l5.05-5.05a.75.75 0 01.225 1.06zM9.05 4.95a2 2 0 012.83 0l7.11 7.11a2 2 0 010 2.83l-7.11 7.11a2 2 0 01-2.83-2.83L11.88 12H3a2 2 0 01-2-2V5a2 2 0 012-2h2.88l4.38-4.38a2 2 0 010 2.83z" />
            </svg>
            Pay Fees
          </a>

          <a
            href="/parent/receipts"
            className="flex items-center gap-2 text-anglican-blue hover:text-anglican-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M12 1a3 3 0 00-3 3v6a3 3 0 006 0V4a3 3 0 00-3-3zm6 13a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
            </svg>
            Receipts
          </a>

          <a
            href="/parent/report-cards"
            className="flex items-center gap-2 text-anglican-blue hover:text-anglican-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2zm0 3a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V8a2 2 0 012-2zm9 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm-5 7a2 2 0 01-2-2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2zm2-6a2 2 0 012-2h2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Reports
          </a>
        </div>
      </footer>
    </div>
  )
}

// Default wrapper for Next.js app router
export default function ParentLayoutWrapper({
  children,
  title = "Parent Portal",
}: {
  children: React.ReactNode
  title?: string
}) {
  return <ParentLayout children={children} title={title} />
}