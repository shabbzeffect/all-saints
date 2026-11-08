"use client"

/* PortalShell - SaintsHub authenticated portal frame
 * Fixed sidebar with brand + grouped navigation, sticky topbar with
 * search (⌘K), notifications and sign-out, mobile slide-over menu.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/config"
import {
  Bell,
  Cross,
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react"
import { NAV_SECTIONS, isActive, pageTitle } from "@/lib/portal-nav"
import { CommandPalette } from "./CommandPalette"

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
    setPaletteOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const sidebar = (
    <div className="flex h-full flex-col bg-anglican-blue-950 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-anglican-gold-400">
          <Cross className="h-5 w-5 text-anglican-blue-950" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-heading text-lg font-bold tracking-wide">SAINTS</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-anglican-blue-200">
            All Saints Mushililie
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-anglican-blue-300">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.links.map((link) => {
                const active = isActive(pathname, link.href)
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer focus-ring-dark",
                        active
                          ? "bg-anglican-gold-400 text-anglican-blue-950"
                          : "text-anglican-blue-100 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {link.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-[10px] leading-relaxed text-anglican-blue-300">
        All Saints Mushililie Management Platform
        <br />© {new Date().getFullYear()}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">{sidebar}</aside>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <button
              className="focus-ring-dark absolute right-3 top-3 rounded-md p-1.5 text-anglican-blue-200 hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Content column */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="focus-ring rounded-md p-2 text-foreground hover:bg-accent lg:hidden cursor-pointer transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  SaintsHub Portal
                </p>
                <h1 className="text-base font-semibold leading-tight sm:text-lg">
                  {pageTitle(pathname)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaletteOpen(true)}
                className="focus-ring hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground sm:flex"
                aria-label="Open command palette (Ctrl K)"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Go to…</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </button>
              <button
                onClick={() => setPaletteOpen(true)}
                className="focus-ring rounded-md p-2 text-foreground transition-colors hover:bg-accent sm:hidden"
                aria-label="Open command palette"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/admin/notifications"
                className="focus-ring relative rounded-full p-2 text-foreground transition-colors hover:bg-accent"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-anglican-gold-400" />
              </Link>
              <Link
                href="/login"
                className="focus-ring flex items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden text-sm font-medium sm:inline">Sign out</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
