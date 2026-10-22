/* Dashboard Layout - SaintsHub
Provides: role-aware navigation, institution switcher, active institution banner
*/
import { Inter } from "next/font/google"
import { cn } from "@/lib/config"
import Link from "next/link"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { LogOut, Settings, Shield, BuildingHouse, GraduationCap, Users, Heart, Calendar, MessageCircle, Mail, Phone, Users2, Folder, Search, Map, X } from "lucide-react"

const inter = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"] })

export function DashboardLayout({
  children,
  title,
  showNav = true,
  showFooter = true,
}: {
  children: React.ReactNode
  title: string
  showNav?: boolean
  showFooter?: boolean
}) {
  const [activeInstitution, setActiveInstitution] = useState<"school" | "parish" | null>(null)
  const searchParams = useSearchParams()
  const institutionFromUrl = searchParams.get("institution")

  // Initialize active institution from session or URL
  useEffect(() => {
    // Check if institution is set in session or defaults
    // In production, this would come from auth session
    const urlInstitution = institutionFromUrl as "school" | "parish" | null
    if (urlInstitution) {
      setActiveInstitution(urlInstitution)
    }
  }, [searchParams])

  const toggleInstitution = (wing: "school" | "parish") => {
    setActiveInstitution(wing)
    // Update URL without reload
    const params = new URLSearchParams()
    params.set("institution", wing)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({ path: newUrl }, "", newUrl)
  }

  return (
    <div className="min-h-screen">
      <Inter
        id="inter"
        weight="400"
        display="swap"
        className="antialiased"
      />

      {/* Topbar with Institution Switcher */}
      {showNav && (
        <header className="border-b border-border bg-background/80 backdrop-blur-sm fixed w-full top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Institution Switcher */}
            <div className="flex items-center gap-2">
              {activeInstitution === "school" && (
                <button
                  onClick={() => toggleInstitution("parish")}
                  className="flex items-center gap-2 px-3 py-1 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                >
                  <BuildingHouse className="h-4 w-4" />
                  Parish
                </button>
              )}
              {activeInstitution === "parish" && (
                <button
                  onClick={() => toggleInstitution("school")}
                  className="flex items-center gap-2 px-3 py-1 rounded-md border border-border hover:bg-accent hover-text-accent-foreground transition-colors text-sm"
                >
                  <BuildingHouse className="h-4 w-4" />
                  School
                </button>
              )}
              {/* Default: show both if neither selected */}
              {activeInstitution === null && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BuildingHouse className="h-4 w-4" /> School
                  <BuildingHouse className="h-4 w-4" /> Parish
                </div>
              )}
            </div>

            {/* Header Content */}
            <div className="flex items-center gap-4">
              {activeInstitution === "school" && (
                <h1 className="text-xl font-semibold text-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  School Management
                </h1>
              )}
              {activeInstitution === "parish" && (
                <h1 className="text-xl font-semibold text-foreground">
                  <BuildingHouse className="h-4 w-4 mr-2" />
                  Parish Management
                </h1>
              )}
              {activeInstitution === null && (
                <h1 className="text-xl font-semibold text-foreground">
                  <BuildingHouse className="h-4 w-4 mr-2" />
                  SaintsHub
                </h1>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <Link href="/auth/onboarding" className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {activeInstitution === "school"
                    ? "S"
                    : activeInstitution === "parish"
                    ? "P"
                    : "U"}
                </Avatar>
                <span className="text-sm font-medium">{activeInstitution || "Select Institution"}</span>
              </Link>

              {/* Notification Bell */}
              <button
                aria-label="Notifications"
                className="relative rounded-full"
                onClick={() => /* open notifications */}
              >
                <span
                  className="absolute -top-1 right-1 bg-primary text-primary-foreground min-w-5 min-h-5 rounded-full text-xs font-bold flex items-center justify-center"
                >
                  5
                </span>
              </button>

              {/* Language / Theme toggle would go here */}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="pt-20 max-w-7xl mx-auto w-full p-4">
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="border-t border-border bg-background/80 backdrop-blur-sm py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>All Saints Mushililie Management Platform</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </footer>
      )}
    </div>
  )
}