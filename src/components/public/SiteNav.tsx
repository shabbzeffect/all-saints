"use client"

/* SiteNav - public site navigation (no auth)
 * SAINTS wordmark, section links, portal login, mobile disclosure
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/config"

export const PUBLIC_LINKS = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/church", label: "Parish" },
  { href: "/events", label: "Events" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
]

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md" aria-label="SAINTS — All Saints Mushililie home">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" role="img" aria-label="All Saints Mushililie crest">
        <circle cx="20" cy="20" r="19" fill={light ? "#d9a441" : "#1f2a44"} stroke={light ? "#1f2a44" : "#d9a441"} strokeWidth="2" />
        <path d="M20 7v26M11 15h18" stroke={light ? "#1f2a44" : "#f5f3ed"} strokeWidth="3.2" strokeLinecap="round" />
      </svg>
      <span className="leading-tight">
        <span className={cn("block font-serif text-lg font-bold tracking-tight", light ? "text-[#f5f3ed]" : "text-[#1f2a44]")}>
          All Saints Mushililie
        </span>
        <span className={cn("block text-[10px] font-semibold uppercase tracking-[0.22em]", light ? "text-[#d9a441]" : "text-[#6f5410]")}>
          Academy &amp; Parish
        </span>
      </span>
    </Link>
  )
}

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#1f2a44]/10 bg-[#f5f3ed]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Wordmark />

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Site">
          {PUBLIC_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-sm text-sm font-medium transition-colors hover:text-[#1f2a44]",
                  active ? "text-[#1f2a44] underline underline-offset-4 decoration-[#d9a441] decoration-2" : "text-[#1f2a44]/70"
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href="/login"
            className="focus-ring rounded-md border border-[#1f2a44] px-3.5 py-1.5 text-sm font-semibold text-[#1f2a44] transition-colors hover:bg-[#1f2a44] hover:text-[#f5f3ed]"
          >
            Portal login
          </Link>
        </nav>

        <button
          className="focus-ring rounded-md p-2 text-[#1f2a44] hover:bg-[#1f2a44]/5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#1f2a44]/10 bg-[#f5f3ed] px-4 pb-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Site mobile">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-[#1f2a44]/5 py-3 text-base font-medium text-[#1f2a44]"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="py-3 text-base font-semibold text-[#6f5410]">
              Portal login →
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}


