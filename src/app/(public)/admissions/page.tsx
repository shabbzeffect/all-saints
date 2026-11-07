import { CheckCircle2, CalendarDays, PhoneCall, FileText, ClipboardCheck, ChevronRight } from "lucide-react"
import Link from "next/link"
import { VisitForm } from "@/components/public/VisitForm"

export const metadata = {
  title: "Admissions & Visit Days — All Saints Mushililie",
  description: "How to join All Saints Mushililie Academy: visit us on a Saturday, see the school your child will walk into, and apply with confidence.",
}

const STEPS = [
  { icon: PhoneCall, title: "Book a visit", text: "Use the form on this page or call +254 712 000 100. Visits every Saturday 09:00–12:00 — and any weekday you can manage." },
  { icon: ClipboardCheck, title: "Walk the promenade", text: "Gate → assembly courtyard → chapel → classrooms. Your child meets the Principal; you meet the bursar. No pressure, no queue." },
  { icon: FileText, title: "Apply", text: "The application form takes 20 minutes at the office. Bring report cards and two passport photos — we help if anything is missing." },
  { icon: CheckCircle2, title: "Decision, in writing", text: "Two weeks. A letter you can hold, not an SMS you have to trust. If we say yes, we mean your child belongs here." },
]

const DATES = [
  { term: "Term 1", opens: "January 2027", closes: "March 2027" },
  { term: "Term 2", opens: "May 2027", closes: "August 2027" },
  { term: "Term 3", opens: "September 2027", closes: "December 2027" },
]

export default function AdmissionsPage() {
  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-[1.02] sm:text-6xl">See the school your child will walk into.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#1f2a44]/75">
            No open day theatre, no audition. Come, look, ask anything. Most families leave knowing — one way or the other —
            within the visit. (Term dates are illustrative for the demo.)
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-3xl font-bold">How you join — four steps, honestly</h2>
              <Link href="/admissions/apply" className="shrink-0 rounded-md bg-[#d9a441] px-4 py-2 text-sm font-bold text-[#1f2a44] transition-colors hover:bg-[#e6b654]">
                Start the application
              </Link>
            </div>
          <ol className="mt-8 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid grid-cols-12 items-baseline gap-4 py-4">
                <span className="col-span-2 font-serif text-3xl font-bold text-[#1f2a44]/25 sm:col-span-1" aria-hidden="true">{i + 1}</span>
                <step.icon className="col-span-2 h-6 w-6 text-[#6f5410] sm:col-span-1" strokeWidth={1.5} aria-hidden="true" />
                <div className="col-span-8">
                  <h3 className="font-serif text-lg font-bold text-[#1f2a44]">{step.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#1f2a44]/75">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Numbered absence — what families actually lack on a first visit */}
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-2xl font-bold leading-tight">Bring seven things.<br />Most families bring four.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#1f2a44]/70">The office asks for seven. Almost every first visit is missing the same three — here they are, named, so you can walk in ready.</p>
            </div>
            <ol className="grid sm:grid-cols-2 lg:col-span-8">
              {[
                { name: "Child's birth certificate", have: true },
                { name: "Two recent passport photos", have: true },
                { name: "Last two school report cards", have: false },
                { name: "Parent ID (both, if possible)", have: true },
                { name: "Immunisation card (PP1 acceptances)", have: false },
                { name: "KSh exam / registration deposit (if offered a place)", have: false },
                { name: "Your phone number and one emergency contact", have: true },
              ].map((item, i) => (
                <li key={item.name} className="flex items-start gap-3 border-t border-[#1f2a44]/10 py-2.5">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${item.have ? "border-[#1f4d33] text-[#1f4d33]" : "border-[#b0322c] text-[#b0322c]"}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#1f2a44]/85">
                    {item.name}
                    {!item.have && <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#b0322c]">usually missing</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Term dates + visit form */}
      <section className="border-b border-[#1f2a44]/12" id="visit">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-[#6f5410]" aria-hidden="true" />
              <h2 className="font-serif text-2xl font-bold">Term dates 2027 (illustrative)</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#1f2a44]/12">
              <table className="w-full text-sm">
                <thead className="bg-[#1f2a44] text-[#f5f3ed]">
                  <tr><th className="px-4 py-2.5 text-left">Term</th><th className="px-4 py-2.5 text-left">Opens</th><th className="px-4 py-2.5 text-left">Closes</th></tr>
                </thead>
                <tbody className="divide-y divide-[#1f2a44]/10 bg-white">
                  {DATES.map((d) => (
                    <tr key={d.term}><td className="px-4 py-2.5 font-semibold">{d.term}</td><td className="px-4 py-2.5">{d.opens}</td><td className="px-4 py-2.5">{d.closes}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 rounded-xl bg-[#1f4d33] p-5 text-[#eef3ea]">
              <p className="font-serif text-lg font-bold">Bursary support</p>
              <p className="mt-1 text-sm leading-relaxed text-[#eef3ea]/85">
                One in ten families here is helped by a partial bursary — church or school fund (illustrative figure for this demo). If fees are the reason you hesitate,
                tell us on the visit. We would rather know your situation than lose a good child to arithmetic.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <VisitForm compact />
            <p className="mt-3 text-center text-xs text-[#1f2a44]/70">
              Or call the office: <a className="font-semibold text-[#1f2a44]" href="tel:+254712000100">+254 712 000 100</a> · Mon–Sat
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-bold">Before you visit</h2>
          <div className="mt-6 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {[
              ["What should we wear on visit day?", "Anything — school uniform if you own a polo, church clothes at most. You are not being examined; your child is."],
              ["Can both parents come?", "Please do. Decisions that shape a child deserve all the hands that will carry them."],
              ["What if we can't attend Saturdays?", "Weekday visits are normal — phone the office and we will rearrange the timetable around you."],
              ["How many places are there per grade?", "Small enough that your child's name is known by Tuesday. We do not run classes of 60 — and never will while we can refuse it."],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-bold text-[#1f2a44]">
                  {q}
                  <span className="text-[#6f5410] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-2 max-w-2xl leading-relaxed text-[#1f2a44]/80">{a}</p>
              </details>
            ))}
          </div>
          <a href="/contact" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4">
            Or find us on the map <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}


