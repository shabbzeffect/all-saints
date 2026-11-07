import Link from "next/link"
import { ChevronRight, Landmark, BookOpen, Heart, Users } from "lucide-react"

export const metadata = {
  title: "About — All Saints Mushililie Academy & Parish",
  description: "An Anglican day and boarding academy in Kakamega County: faith formed, minds stretched, character kept. Our story, values and leadership.",
}

const VALUES = [
  { word: "Faith", line: "Not taught by shouting, but caught — chapel each morning, scripture woven into the day, and a pastoral heart for every child." },
  { word: "Mind", line: "The Competency-Based Curriculum taught properly — play in pre-primary, foundations in primary, pre-technical pathways in junior school." },
  { word: "Character", line: "Duty, service, time-keeping, honesty before and after the exam. Children graduate knowing who they are and whose they are." },
]

const STORY_POINTS = [
  "A congregation became a school; the school welcomed the congregation&rsquo;s children; the chapel and the classroom never stopped belonging to each other.",
  "Everything here was built in small gifts — a pew from one family, a window from another, a bursary from the women&rsquo;s guild.",
  "(Illustrative narrative — the real history goes here once the archivist confirms it.)",
]

export default function AboutPage() {
  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-[1.02] sm:text-6xl">A family that prays together, studies together, and stays together.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#1f2a44]/75">
            All Saints Mushililie is one institution with two doors — an academy serving PP1 to Grade 9 and an
            Anglican parish serving Kakamega County — under one Anglican roof, one quiet morning assembly,
            one long-haul commitment to children who will know their names and keep them.
          </p>
        </div>
      </section>

      {/* Values as big type, not icons-in-cards */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">What we stand for</h2>
          <div className="mt-8 divide-y divide-[#1f2a44]/12">
            {VALUES.map((v) => (
              <div key={v.word} className="grid grid-cols-12 gap-4 py-6">
                <p className="col-span-3 font-serif text-4xl font-bold text-[#1f2a44]/25 sm:col-span-2 sm:text-6xl" aria-hidden="true">{v.word[0]}</p>
                <div className="col-span-9 sm:col-span-9">
                  <h3 className="font-serif text-2xl font-bold text-[#1f2a44]">{v.word}</h3>
                  <p className="mt-1 max-w-2xl leading-relaxed text-[#1f2a44]/75">{v.line}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story + timeline */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Landmark className="h-8 w-8 text-[#6f5410]" strokeWidth={1.4} aria-hidden="true" />
            <h2 className="mt-3 font-serif text-3xl font-bold">The story so far</h2>
            <p className="mt-3 leading-relaxed text-[#1f2a44]/75">
              {STORY_POINTS.map((p, i) => (
                <span key={i} className="mt-2 block first:mt-0">{p}</span>
              ))}
            </p>
          </div>
          <div className="lg:col-span-7">
            <p className="rounded-lg border border-[#d9a441]/60 bg-[#d9a441]/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6f5410]">
              Placeholder — every line below is illustrative until the parish archivist confirms the real record
            </p>
            <ol className="mt-4">
              {[
                "(Illustrative) A congregation gathers — Sundays under a tree, school on weekdays.",
                "(Illustrative) The first permanent classrooms rise beside the chapel.",
                "(Illustrative) The boarding wing opens; the chapel receives its stained glass, one window at a time.",
                "(Illustrative) The library is built from a county bursary appeal.",
                "(Illustrative) CBC is adopted early across all grades.",
                "(Illustrative) Today — PP1 to Grade 9, day and boarding, one campus, one act of light.",
              ].map((text, i) => (
                <li key={i} className="grid grid-cols-12 gap-4 border-l-2 border-[#d9a441] py-3 pl-5">
                  <p className="col-span-2 font-serif text-lg font-bold text-[#6f5410]">{String(i + 1).padStart(2, "0")}</p>
                  <p className="col-span-10 text-sm leading-relaxed text-[#1f2a44]/80">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Leadership by role */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-bold">Who you will meet on visit day</h2>
          <div className="mt-6 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {[
              { role: "The Principal", note: "Walks you through the fee structure, the uniforms and the calendar — and will ask your child the one question that matters: what do you love?" },
              { role: "The Chaplain", note: "Keeper of morning assembly, midweek chapel and the quiet pastoral phone calls to parents when something feels off." },
              { role: "The Bursar", note: "Fees, M-Pesa, receipts, bursary applications. Honest ledger, no hidden lines — that&rsquo;s a promise written on the office wall." },
              { role: "The Senior Teacher (Junior School)", note: "KPSEA and KJSEA pathways, Clubs, and the weekly progress note every junior parent receives." },
            ].map((p) => (
              <div key={p.role} className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12">
                <p className="font-serif text-lg font-bold text-[#1f2a44] sm:col-span-4">{p.role}</p>
                <p className="text-sm leading-relaxed text-[#1f2a44]/75 sm:col-span-8">{p.note}</p>
              </div>
            ))}
          </div>
          <Link href="/admissions" className="mt-8 inline-flex items-center gap-2 font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4 hover:decoration-[#1f2a44]">
            Book the visit where you&rsquo;ll meet them all <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}


