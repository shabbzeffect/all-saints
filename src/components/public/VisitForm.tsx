"use client"

/* VisitForm - sign the visitor book (demo: no network call, stored locally)
 * Used on the homepage hero, admissions and contact pages
 */
import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/config"

const GRADES = ["PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7 (Junior)", "Grade 8 (Junior)", "Grade 9 (Junior)"]

export function VisitForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [grade, setGrade] = useState("Grade 7 (Junior)")
  const [date, setDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError("We need your name and phone number to call you back.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const entry = { name: name.trim(), phone: phone.trim(), grade, date: date || null, at: new Date().toISOString() }
      const existing = JSON.parse(window.localStorage.getItem("saints-visitors") ?? "[]") as unknown[]
      window.localStorage.setItem("saints-visitors", JSON.stringify([...existing, entry]))
    } catch {
      /* localStorage unavailable — still show confirmation */
    }
    window.setTimeout(() => {
      setSaving(false)
      setDone(true)
    }, 600)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-[#d9a441]/60 bg-[#1f2a44] p-5 text-[#f5f3ed]" role="status">
        <CheckCircle2 className="h-8 w-8 text-[#d9a441]" strokeWidth={1.8} />
        <p className="mt-2 font-serif text-lg font-bold">Asante, {name.split(" ")[0] || "friend"}.</p>
        <p className="mt-1 text-sm leading-relaxed text-[#f5f3ed]/85">
          The office will call <span className="font-semibold text-[#d9a441]">{phone}</span> within one working day to
          confirm your visit{date ? " on " + new Date(date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" }) : ""}.
          Come as you are — we look forward to meeting you and your child.
        </p>
        <a href="tel:+254712000100" className="mt-3 inline-block text-xs text-[#f5f3ed]/60 hover:text-[#f5f3ed]">
          In a hurry? Call the office now: +254 712 000 100
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      id="visitor-book"
      className={cn(
        "rounded-xl border border-[#1f2a44]/15 bg-white p-5 shadow-[0_1px_0_0_#d9a441]",
        compact && "p-4"
      )}
      aria-label="Sign the visitor book"
    >
      <p className="font-serif text-base font-bold text-[#1f2a44]">Sign the visitor book</p>
      <p className="mt-0.5 text-xs text-[#1f2a44]/70">Book a free school visit — it takes under a minute.</p>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`vf-name`} className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70">Parent name</label>
          <input
            id="vf-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Mary Wafula"
            className="w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm text-[#1f2a44] outline-none transition placeholder:text-[#1f2a44]/70 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="vf-phone" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70">Phone (M-Pesa)</label>
          <input
            id="vf-phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="0712 345 678"
            className="w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm text-[#1f2a44] outline-none transition placeholder:text-[#1f2a44]/70 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/40"
          />
        </div>
        <div>
          <label htmlFor="vf-grade" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70">Applying for</label>
          <select
            id="vf-grade"
            name="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm text-[#1f2a44] outline-none focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/40"
          >
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="vf-date" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70">Preferred date</label>
          <input
            id="vf-date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm text-[#1f2a44] outline-none focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/40"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-[#8e2a3c]">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#d9a441] px-4 py-2.5 font-serif text-sm font-bold uppercase tracking-wide text-[#1f2a44] transition-colors hover:bg-[#e6b654] disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {saving ? "Signing the book…" : "Book our school visit"}
      </button>
      <p className="mt-1.5 text-center text-[10px] leading-snug text-[#1f2a44]/70">
        We confirm within one working day — a person, not a robot. (Demo: nothing is sent from this device.)
      </p>
    </form>
  )
}

