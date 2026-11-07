import Link from "next/link"
import { BookOpenCheck, BedDouble, Trophy, ClipboardCheck, ChevronRight } from "lucide-react"

export const metadata = {
  title: "Academics & Boarding — All Saints Mushililie",
  description: "PP1 to Grade 9 under Kenya's CBC, daily chapel, KPSEA & KJSEA coaching, and boarding residence with dorm duty and exeat passes.",
}

const BANDS = [
  {
    band: "PP1—PP2 · Pre-Primary",
    title: "Play is the work of the child",
    lines: ["Rhymes, stories, counting, colour, sharing and the school anthem every single morning.", "Small groups — three assistants per class, one tray of crayons per child."],
  },
  {
    band: "Grade 1—6 · Primary",
    title: "Foundations, laid like stone",
    lines: ["Literacy, numeracy, Kiswahili, Science, Social Studies, Art & Craft, CRE.", "Termly reports you can read — scores, remarks, and one thing your child is proud of."],
  },
  {
    band: "Grade 7—9 · Junior School",
    title: "Pre-technical pathways, real coaching",
    lines: ["Pre-vocational and academic pathways; KPSEA at Grade 6, KJSEA at Grade 9.", "Clubs: coding, chess, choir, journalism, agriculture; every primary sits KPSEA and every junior aims squarely at KJSEA — prepared in-house, not outsourced."],
  },
]

const CLUBS = ["Choir & Chapel Band", "Rugby & Netball", "Debate & Drama", "Coding Club", "Agriculture & Garden", "Journalism & Radio", "Scouts & Guides", "Environmental & Tree-planting", "Chess", "Library & Book Club"]

export default function AcademicsPage() {
  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-[1.02] sm:text-6xl">Faith first. Then the brain gets to eat.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#1f2a44]/75">
            Kenya&rsquo;s Competency-Based Curriculum taught by people who retrained for it, measured honestly,
            coached personally — and never divorced from the chapel that forms the child using it.
          </p>
        </div>
      </section>

      {/* Pathway */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-bold">The CBC journey, stage by stage</h2>
          <div className="mt-8 space-y-0 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {BANDS.map((band) => (
              <div key={band.band} className="grid grid-cols-1 gap-3 py-6 md:grid-cols-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f5410] md:col-span-3 md:pt-1">{band.band}</p>
                <div className="md:col-span-9">
                  <h3 className="font-serif text-xl font-bold text-[#1f2a44]">{band.title}</h3>
                  {band.lines.map((line) => (
                    <p key={line} className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#1f2a44]/75">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boarding + Fees */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BedDouble className="h-8 w-8 text-[#6f5410]" strokeWidth={1.4} aria-hidden="true" />
            <h2 className="mt-3 font-serif text-3xl font-bold">Boarding, for some</h2>
            <p className="mt-3 leading-relaxed text-[#1f2a44]/75">
              A residence with rules, rhythm and rest — the kind of house your child grows into. Boarders share
              breakfast before the anthem, prep before vespers, and duty every day. Exeat passes are granted
              for family, medical and faith obligations — and signed by you before anyone leaves.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#1f2a44]/80">
              <li className="flex gap-2"><span className="text-[#6f5410]">·</span> Dorm duty &amp; prefect system from Grade 4</li>
              <li className="flex gap-2"><span className="text-[#6f5410]">·</span> Weekly progress notes home every Friday</li>
              <li className="flex gap-2"><span className="text-[#6f5410]">·</span> Boarding levy KSh 18,000 per term (illustrative)</li>
              <li className="flex gap-2"><span className="text-[#6f5410]">·</span> Visitors welcome on visiting Sundays — sign the book at the gate</li>
            </ul>
          </div>
          <div className="lg:col-span-5">
            <h3 className="font-serif text-xl font-bold">Indicative fees per term <span className="font-sans text-xs font-normal text-[#1f2a44]/70">(illustrative)</span></h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#1f2a44]/12">
              <table className="w-full text-sm">
                <thead className="bg-[#1f2a44] text-[#f5f3ed]">
                  <tr><th className="px-4 py-2.5 text-left">Level</th><th className="px-4 py-2.5 text-right">Day</th><th className="px-4 py-2.5 text-right">Boarding</th></tr>
                </thead>
                <tbody className="divide-y divide-[#1f2a44]/10 bg-white">
                  <tr><td className="px-4 py-2">Pre-Primary</td><td className="px-4 py-2 text-right">KSh 25,000</td><td className="px-4 py-2 text-right">—</td></tr>
                  <tr><td className="px-4 py-2">Primary</td><td className="px-4 py-2 text-right">KSh 32,000</td><td className="px-4 py-2 text-right">KSh 50,000</td></tr>
                  <tr><td className="px-4 py-2">Junior School</td><td className="px-4 py-2 text-right">KSh 40,000</td><td className="px-4 py-2 text-right">KSh 58,000</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-[#1f2a44]/70">M-Pesa, bank deposit and bursary support available. Full structure published on visit day.</p>
            <Link href="/admissions" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4">
              Admissions &amp; visit days <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clubs as a ribbon, not a card grid */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#6f5410]" aria-hidden="true" />
            <h2 className="font-serif text-3xl font-bold">Where talent gets its name</h2>
          </div>
          <p className="mt-2 max-w-xl text-[#1f2a44]/70">Every club, every child who wants in. No auditions, no fees — just show up after lessons.</p>
          <ul className="mt-6 columns-2 gap-6 text-[#1f2a44]/80 sm:columns-3 lg:columns-5">
            {CLUBS.map((club) => (
              <li key={club} className="mb-2 break-inside-avoid border-b border-[#1f2a44]/10 pb-2 text-sm">{club}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}


