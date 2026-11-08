"use client"

/* CommandPalette - ⌘K / Ctrl+K fuzzy finder for portal navigation
 * Keyboard-first: arrows move, Enter opens, Escape closes.
 */
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, CornerDownLeft, X } from "lucide-react"
import { NAV_SECTIONS, type NavLink } from "@/lib/portal-nav"

interface FlatItem {
  section: string
  link: NavLink
  haystack: string
}

const FLAT: FlatItem[] = NAV_SECTIONS.flatMap((section) =>
  section.links.map((link) => ({
    section: section.label,
    link,
    haystack: `${section.label} ${link.title} ${link.href}`.toLowerCase(),
  }))
)

function fuzzyScore(haystack: string, query: string): number {
  if (!query) return 0
  const q = query.toLowerCase().trim()
  if (haystack.includes(q)) return 100 - haystack.indexOf(q)
  let i = 0
  for (const ch of haystack) {
    if (ch === q[i]) i++
    if (i === q.length) return 10
  }
  return -1
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return FLAT.map((item) => ({ item, score: 0 }))
    return FLAT.map((item) => ({ item, score: fuzzyScore(item.haystack, q) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setActive((v) => Math.min(v + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActive((v) => Math.max(v - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const target = results[active]?.item.link.href
        if (target) {
          router.push(target)
          onClose()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, results, active, router, onClose])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [active])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_16px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to page…"
            aria-label="Go to page"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No pages match &ldquo;{query}&rdquo;</p>
          )}
          {results.map(({ item }, i) => {
            const Icon = item.link.icon
            const selected = i === active
            return (
              <button
                key={item.link.href}
                data-index={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  router.push(item.link.href)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                  selected ? "bg-anglican-blue-600 text-white" : "text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${selected ? "text-anglican-gold-400" : "text-muted-foreground"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{item.link.title}</span>
                  <span className={`block truncate text-[11px] ${selected ? "text-white/70" : "text-muted-foreground"}`}>
                    {item.section} · {item.link.href}
                  </span>
                </span>
                {selected && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span><kbd className="rounded border border-border bg-muted px-1">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border border-border bg-muted px-1">↵</kbd> open</span>
          <span><kbd className="rounded border border-border bg-muted px-1">esc</kbd> close</span>
          <span className="ml-auto"><kbd className="rounded border border-border bg-muted px-1">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}
