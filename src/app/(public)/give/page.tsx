import { Banknote, Building2, HeartHandshake, BadgeCheck, Landmark } from "lucide-react"

export const metadata = {
  title: "Give — All Saints Mushililie",
  description: "Give to the school and parish family of All Saints Mushililie: bursary fund, building fund, chapel roof, or the weekly offering.",
}

export default function GivePage() {
  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-[1.02] sm:text-6xl">Give to the work.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#1f2a44]/75">
            No one here is asked to give who does not eat first. When you do give — a pew, a window, a bursary —
            you will know exactly where it went, because we will tell you, by name, in the newsletter.
          </p>
        </div>
      </section>

      {/* Ways to give */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-bold">Ways to give</h2>
          <div className="mt-8 grid gap-0 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {[
              { icon: Banknote, title: "M-Pesa", detail: "Paybill 247 247, Account: YOUR NAME + FUND (e.g. Mary Wafula — BURSARY). You will receive a confirmation SMS immediately. (Demo paybill.)" },
              { icon: Landmark, title: "Bank deposit", detail: "All Saints Mushililie — Account 0123456789, Equity Bank Mushililie Branch. Reference your name and the fund." },
              { icon: HeartHandshake, title: "Offerings envelope", detail: "The blue envelope in the chapel or the collection plate on Sunday — school and parish share every gift unless you write otherwise." },
              { icon: Building2, title: "Pledged giving", detail: "Monthly standing order for the building fund or a named bursary. The treasurer visits you, coffee in hand, and sets it up." },
            ].map((way) => (
              <div key={way.title} className="grid grid-cols-12 gap-4 py-5">
                <way.icon className="col-span-2 h-7 w-7 text-[#1f4d33] sm:col-span-1" strokeWidth={1.4} aria-hidden="true" />
                <div className="col-span-10 sm:col-span-11">
                  <h3 className="font-serif text-lg font-bold">{way.title}</h3>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#1f2a44]/75">{way.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funds with progress — illustrative */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-bold">Where the money goes</h2>
          <p className="mt-2 text-sm text-[#1f2a44]/70">Progress bars are illustrative for the demo. Audited annually, report published in the April newsletter.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { fund: "Building Fund", target: "Parish hall — KSh 12.0M", pct: 67, note: "Hall foundation laid in June; dedication at the Feast of St Andrew." },
              { fund: "Chapel Roof", target: "New timber & iron sheeting — KSh 650K", pct: 40, note: "The diocesan engineer signed off the drawings last Sunday." },
              { fund: "Bursary Fund", target: "One in ten families helped", pct: 30, note: "Four children are fully or partly paid from this fund this term." },
            ].map((f) => (
              <div key={f.fund} className="flex flex-col border-t-2 border-[#1f2a44]/20 pt-4">
                <h3 className="font-serif text-xl font-bold">{f.fund}</h3>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-[#6f5410]">{f.target}</p>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#1f2a44]/12" role="progressbar" aria-valuenow={f.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${f.fund} progress`}>
                  <div className="h-full rounded-full bg-[#1f4d33]" style={{ width: `${f.pct}%` }} />
                </div>
                <p className="mt-1 text-sm font-semibold">{f.pct}%</p>
                <p className="mt-1 text-sm leading-relaxed text-[#1f2a44]/70">{f.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#1f4d33] p-6 text-[#eef3ea]">
            <div>
              <p className="font-serif text-2xl font-bold">120 households give monthly.</p>
              <p className="mt-1 text-sm text-[#eef3ea]/90">Join them — even KSh 500 a month keeps a bursary alive.</p>
            </div>
            <a href="mailto:treasurer@allsaintsmushililie.ac.ke?subject=I%20would%20like%20to%20give%20monthly" className="inline-flex items-center gap-2 rounded-md bg-[#d9a441] px-5 py-2.5 font-bold text-[#1f4d33] hover:bg-[#e6b654]">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Become a monthly giver
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}


