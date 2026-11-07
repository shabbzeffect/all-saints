"use client"

/* Admission application — public site
 * Three short steps + review. Demo storage with reference number on submit.
 */
import { useState } from "react"
import Link from "next/link"
import { ChevronRight, CheckCircle2, Loader2, User, Users2, FolderCheck, ClipboardCheck } from "lucide-react"

const GRADES = ["PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"]
const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Grandmother", "Grandfather", "Uncle/Aunt", "Other"]

const STEPS = [
  { id: 1, label: "You", icon: Users2 },
  { id: 2, label: "Child", icon: User },
  { id: 3, label: "Documents", icon: FolderCheck },
  { id: 4, label: "Review", icon: ClipboardCheck },
]

interface GuardianState { fullName: string; phone: string; relationship: string; email: string }
interface ChildState { fullName: string; dob: string; previousSchool: string; grade: string; residence: "DAY" | "BOARDING" }
interface DocsState { birthCert: boolean; reports: boolean; photos: boolean; immunisation: boolean; originalsWillBring: boolean }
const INITIAL_DOCS: DocsState = { birthCert: false, reports: false, photos: false, immunisation: false, originalsWillBring: true }

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [guardian, setGuardian] = useState<GuardianState>({ fullName: "", phone: "", relationship: "Mother", email: "" })
  const [child, setChild] = useState<ChildState>({ fullName: "", dob: "", previousSchool: "", grade: "Grade 1", residence: "DAY" })
  const [docs, setDocs] = useState<DocsState>(INITIAL_DOCS)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)

  const canContinueStep1 = guardian.fullName.trim().length >= 2 && guardian.phone.trim().length >= 9
  const canContinueStep2 = child.fullName.trim().length >= 2 && child.dob.length >= 6
  const docsHavecore = docs.birthCert && docs.reports && docs.photos

  const update = (section: "guardian" | "child", field: string, value: string) => {
    if (section === "guardian") setGuardian((p) => ({ ...p, [field]: value }))
    else setChild((p) => ({ ...p, [field]: value }))
  }

  const toggleDoc = (key: keyof DocsState) => setDocs((p) => ({ ...p, [key]: !p[key] }))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/admissions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardian, child, documents: docs, notes }),
      })
      const body = await res.json().catch(() => null)
      if (res.ok && body?.success) {
        setReference(body.reference)
        setPersisted(Boolean(body.stored))
      } else {
        setError(body?.error ?? "Could not submit. Please try again.")
      }
    } catch {
      setError("Network error. Your application was not submitted — please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const field = "w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm text-[#1f2a44] outline-none transition placeholder:text-[#1f2a44]/70 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/40"
  const label = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70"

  if (reference) {
    return (
      <div className="bg-[#f5f3ed]">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <CheckCircle2 className="h-12 w-12 text-[#1f4d33]" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#1f2a44] sm:text-5xl">Hongera. We have your application.</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-[#1f2a44]/80">
            <span className="font-mono font-semibold">{reference}</span> — <span className="font-semibold">{child.fullName}</span> for {child.grade} ({child.residence.toLowerCase()}).
            The office will call {guardian.phone} within five working days to invite you and {child.fullName.split(" ")[0] || "the child"} for a promenade day.
          </p>
          <p className="mt-3 text-xs text-[#1f2a44]/70">
            {persisted ? "Recorded in the school admissions register." : "Demo build — recorded on this device until the database is connected. The school will not lose it; it is how every family begins."}
          </p>
          <div className="mt-6 rounded-xl border border-[#1f2a44]/15 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f5410]">Bring on visit day</p>
            <ul className="mt-2 grid grid-cols-1 gap-1 text-sm text-[#1f2a44]/85 sm:grid-cols-2">
              <li>· Original birth certificate</li>
              <li>· Two report cards</li>
              <li>· Two passport photos</li>
              <li>· Immunisation card (PP1)</li>
            </ul>
          </div>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4">
            Back to the homepage <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="font-serif text-4xl font-bold leading-[1.02] sm:text-6xl">Apply to All Saints.</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#1f2a44]/75">
            Four steps, twenty minutes, one phone number that will actually ring. Start with the person applying on behalf of the child —
            we will do the rest together.
          </p>
        </div>
      </section>

      {/* Progress rail */}
      <ol className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 pt-8 sm:px-6" aria-label="Application progress">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${step >= s.id ? "border-[#1f2a44] bg-[#1f2a44] text-[#d9a441]" : "border-[#1f2a44]/30 text-[#1f2a44]/50"}`}>
              {s.id}
            </span>
            <s.icon className="hidden h-4 w-4 text-[#6f5410] sm:block" strokeWidth={1.6} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1f2a44]/75">{s.label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-[#1f2a44]/15" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        {/* STEP 1 — guardian */}
        {step === 1 && (
          <fieldset className="rounded-xl border border-[#1f2a44]/12 bg-white p-6">
            <legend className="font-serif text-2xl font-bold text-[#1f2a44]">You, the one applying</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="g-name" className={label}>Your full name</label>
                <input id="g-name" className={field} value={guardian.fullName} onChange={(e) => update("guardian", "fullName", e.target.value)} placeholder="e.g. Mary Wafula" required />
              </div>
              <div>
                <label htmlFor="g-phone" className={label}>Phone (M-Pesa)</label>
                <input id="g-phone" type="tel" className={field} value={guardian.phone} onChange={(e) => update("guardian", "phone", e.target.value)} placeholder="0712 345 678" required />
              </div>
              <div>
                <label htmlFor="g-rel" className={label}>Relationship to the child</label>
                <select id="g-rel" className={field} value={guardian.relationship} onChange={(e) => update("guardian", "relationship", e.target.value)}>
                  {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="g-email" className={label}>Email (optional)</label>
                <input id="g-email" type="email" className={field} value={guardian.email} onChange={(e) => update("guardian", "email", e.target.value)} placeholder="you@example.co.ke" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => canContinueStep1 && setStep(2)} disabled={!canContinueStep1} className="rounded-md bg-[#1f2a44] px-6 py-2.5 font-semibold text-[#f5f3ed] transition-colors hover:bg-[#2a3a5f] disabled:cursor-not-allowed disabled:opacity-40">
                Continue — the child
              </button>
            </div>
          </fieldset>
        )}

        {/* STEP 2 — child */}
        {step === 2 && (
          <fieldset className="rounded-xl border border-[#1f2a44]/12 bg-white p-6">
            <legend className="font-serif text-2xl font-bold text-[#1f2a44]">The child</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="c-name" className={label}>Child&rsquo;s full name</label>
                <input id="c-name" className={field} value={child.fullName} onChange={(e) => update("child", "fullName", e.target.value)} placeholder="e.g. Adeline Akinyi" required />
              </div>
              <div>
                <label htmlFor="c-dob" className={label}>Date of birth</label>
                <input id="c-dob" type="date" className={field} value={child.dob} onChange={(e) => update("child", "dob", e.target.value)} required />
              </div>
              <div>
                <label htmlFor="c-prev" className={label}>Current school (if any)</label>
                <input id="c-prev" className={field} value={child.previousSchool} onChange={(e) => update("child", "previousSchool", e.target.value)} placeholder="e.g. Mushililie Primary" />
              </div>
              <div>
                <label htmlFor="c-grade" className={label}>Applying for</label>
                <select id="c-grade" className={field} value={child.grade} onChange={(e) => update("child", "grade", e.target.value)}>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <span className={label}>Residence</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["DAY", "BOARDING"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setChild((p) => ({ ...p, residence: r }))}
                      aria-pressed={child.residence === r}
                      className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${child.residence === r ? "border-[#1f2a44] bg-[#1f2a44] text-[#d9a441]" : "border-[#1f2a44]/25 text-[#1f2a44]/75 hover:border-[#1f2a44]"}`}
                    >
                      {r === "DAY" ? "Day scholar" : "Boarding"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm font-semibold text-[#1f2a44]/70 hover:text-[#1f2a44]">← Back</button>
              <button onClick={() => canContinueStep2 && setStep(3)} disabled={!canContinueStep2} className="rounded-md bg-[#1f2a44] px-6 py-2.5 font-semibold text-[#f5f3ed] transition-colors hover:bg-[#2a3a5f] disabled:cursor-not-allowed disabled:opacity-40">
                Continue — documents
              </button>
            </div>
          </fieldset>
        )}

        {/* STEP 3 — documents */}
        {step === 3 && (
          <fieldset className="rounded-xl border border-[#1f2a44]/12 bg-white p-6">
            <legend className="font-serif text-2xl font-bold text-[#1f2a44]">Documents you hold today</legend>
            <p className="mt-1 text-sm text-[#1f2a44]/70">Tick what you already have. Missing pieces are fine — we will name them on visit day.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { key: "birthCert" as const, label: "Birth certificate (original on visit day)" },
                { key: "reports" as const, label: "Two most recent report cards" },
                { key: "photos" as const, label: "Two passport photos" },
                { key: "immunisation" as const, label: "Immunisation card (PP1 children)" },
                { key: "originalsWillBring" as const, label: "I will bring the original birth certificate" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleDoc(item.key)}
                  aria-pressed={docs[item.key]}
                  className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${docs[item.key] ? "border-[#1f4d33] bg-[#1f4d33]/5" : "border-[#1f2a44]/15 hover:border-[#1f2a44]/40"}`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${docs[item.key] ? "border-[#1f4d33] bg-[#1f4d33] text-white" : "border-[#1f2a44]/30 text-transparent"}`} aria-hidden="true">✓</span>
                  <span className="text-sm leading-snug text-[#1f2a44]/85">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label htmlFor="notes" className={label}>Anything we should know (optional)</label>
              <textarea id="notes" rows={2} maxLength={600} className={field} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Adeline transfers from Mushililie Primary; needs extra reading support." />
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="text-sm font-semibold text-[#1f2a44]/70 hover:text-[#1f2a44]">← Back</button>
              <button onClick={() => setStep(4)} className="rounded-md bg-[#1f2a44] px-6 py-2.5 font-semibold text-[#f5f3ed] transition-colors hover:bg-[#2a3a5f]">Review the application</button>
            </div>
            {!docsHavecore && <p className="mt-3 text-center text-xs text-[#8a2a1f]/80">Three core documents (birth certificate, reports, photos) make acceptance smoother — but apply anyway if you have less.</p>}
          </fieldset>
        )}

        {/* STEP 4 — review */}
        {step === 4 && (
          <fieldset className="rounded-xl border border-[#1f2a44]/12 bg-white p-6">
            <legend className="font-serif text-2xl font-bold text-[#1f2a44]">Read it once, then submit</legend>
            <dl className="mt-4 divide-y divide-[#1f2a44]/10">
              <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-[#1f2a44]/70">Applicant</dt><dd className="mt-1">{guardian.fullName} — {guardian.relationship} · {guardian.phone}{guardian.email ? ` · ${guardian.email}` : ""}</dd></div>
              <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-[#1f2a44]/70">Child</dt><dd className="mt-1">{child.fullName} — born {child.dob ? new Date(child.dob).toLocaleDateString("en-KE") : "—"}{child.previousSchool ? ` · from ${child.previousSchool}` : ""}</dd></div>
              <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-[#1f2a44]/70">Place</dt><dd className="mt-1">{child.grade} · {child.residence === "DAY" ? "Day scholar" : "Boarding"} · 2027 intake</dd></div>
              <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-[#1f2a44]/70">Documents (ticked)</dt><dd className="mt-1">{[["Birth certificate", docs.birthCert], ["Report cards", docs.reports], ["Passport photos", docs.photos], ["Immunisation", docs.immunisation], ["Originals on visit day", docs.originalsWillBring]].filter(([, v]) => v).map(([k]) => k).join(" · ") || "None yet — we will help"}</dd></div>
              {notes && <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-[#1f2a44]/70">Notes</dt><dd className="mt-1">{notes}</dd></div>}
            </dl>
            {error && <p className="mt-3 rounded-md border border-[#b0322c]/30 bg-[#b0322c]/5 p-3 text-sm text-[#b0322c]">{error}</p>}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button onClick={() => setStep(3)} className="text-sm font-semibold text-[#1f2a44]/70 hover:text-[#1f2a44]">← Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="rounded-md bg-[#d9a441] px-6 py-3 font-serif text-base font-bold uppercase tracking-wide text-[#1f2a44] transition-colors hover:bg-[#e6b654] disabled:opacity-60">
                {submitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</span> : "Submit the application"}
              </button>
            </div>
          </fieldset>
        )}
      </div>
    </div>
  )
}
