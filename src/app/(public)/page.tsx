import Link from "next/link"
import { Flag, Sun, BookOpenCheck, Coffee, UtensilsCrossed, Trophy, MoonStar, ArrowRight, ChevronRight, Church, GraduationCap } from "lucide-react"
import { VisitForm } from "@/components/public/VisitForm"

const DAY = [
  { time: "07:10", label: "The flag goes up", note: "All school gathers — silence, then the anthem.", icon: Flag },
  { time: "07:30", label: "Assembly & prayer", note: "Hymn, scripture, notices — the chapel holds us first.", icon: Sun },
  { time: "08:00", label: "Lessons begin", note: "CBC from Grade 1 to Junior — every child named, every child known.", icon: BookOpenCheck },
  { time: "10:30", label: "Tea & play", note: "Half an hour outside. Chapel windows on the field.", icon: Coffee },
  { time: "13:00", label: "Lunch & duty", note: "Duty is a lesson. Prefects serve, everyone eats.", icon: UtensilsCrossed },
  { time: "15:30", label: "Games & clubs", note: "Rugby, netball, choir, coding — talent has a place here.", icon: Trophy },
  { time: "17:00", label: "Vespers & home", note: "A short evening prayer, then gates open. Boarders stay for prep.", icon: MoonStar },
]

const RIBBON = [
  { time: "07:10", name: "Flag", from: "#c94a3a", to: "#8e2a3c", text: "text-white" },
  { time: "07:30", name: "Chapel", from: "#e9bc55", to: "#c98f1e", text: "text-[#241703]" },
  { time: "08:00", name: "Lessons", from: "#1e6d82", to: "#0e3f4f", text: "text-white" },
  { time: "10:30", name: "Play", from: "#2e6b4f", to: "#1f4d33", text: "text-white" },
  { time: "13:00", name: "Duty", from: "#8a6a42", to: "#4a3220", text: "text-white" },
  { time: "15:30", name: "Games & clubs", from: "#4b5aa8", to: "#232c5e", text: "text-white" },
  { time: "17:00", name: "Vespers", from: "#6a4a8a", to: "#33204f", text: "text-white" },
]

export default function PublicHome() {
  return (
    <>
      {/* ============ FIRST VIEWPORT — the nave ============ */}
      <section className="relative overflow-hidden bg-[#f5f3ed]">
        {/* hairline arch behind everything */}
        <svg viewBox="0 0 1440 720" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" preserveAspectRatio="xMidYMid slice">
          <path d="M720 40c-260 120-400 260-400 680h800C1120 300 980 160 720 40Z" fill="none" stroke="#1f2a44" strokeWidth="22" />
        </svg>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:pt-10">
          {/* Left: word + booking */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.03em] text-[#1f2a44]">
              <span className="block text-5xl sm:text-6xl xl:text-7xl">Faith. Mind.</span>
              <span className="block text-5xl sm:text-6xl xl:text-7xl">Character.<span className="text-[#d9a441]">.</span></span>
              <span className="mt-3 block text-2xl font-medium italic leading-snug tracking-normal text-[#1f2a44]/85 sm:text-3xl">One school day, one family — at All Saints.</span>
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#1f2a44]/80">
              A small Anglican academy in Kakamega County — PP1 to Grade 9, day and boarding.
              Your child is known by name here, prayed for by name, and taught like it matters. Because it does.
            </p>

            <div className="mt-5 max-w-md">
              <VisitForm />
            </div>

            {/* the visit as named steps */}
            <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-medium uppercase tracking-wider text-[#1f2a44]/70">
              <li className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1f2a44]/35 text-[9px]">1</span> The gate</li>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <li className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1f2a44]/35 text-[9px]">2</span> Assembly courtyard</li>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <li className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1f2a44]/35 text-[9px]">3</span> Chapel</li>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <li className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1f2a44]/35 text-[9px]">4</span> Classrooms</li>
            </ol>
          </div>

          {/* Right: the stained-glass school day */}
          <div className="flex items-center justify-center lg:col-span-5">
            <figure className="w-full max-w-md">
              <div className="relative mx-auto overflow-hidden border-2 border-[#1f2a44]/25 shadow-[0_24px_60px_-24px_rgba(31,42,68,0.55)]" style={{ borderRadius: "50% 50% 0 0 / 14% 14% 0 0", height: "min(58vh, 480px)" }}>
                <div className="flex h-full w-full flex-col pt-4">
                  {RIBBON.map((shaft) => (
                    <div
                      key={shaft.time}
                      className={`relative flex flex-1 items-center justify-between border-b border-black/25 px-4 ${shaft.text} ${shaft.name === "Chapel" ? "ribbon-glow" : ""} last:border-b-0`}
                      style={{ background: `linear-gradient(160deg, ${shaft.from}, ${shaft.to})` }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">{shaft.time}</span>
                      <span className="font-serif text-sm font-bold uppercase tracking-[0.12em]">{shaft.name}</span>
                    </div>
                  ))}
                </div>
                {/* one shaft of light sweeping through the glass — fires once */}
                <div className="ribbon-shimmer pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" aria-hidden="true" />
              </div>
              <figcaption className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1f2a44]/70">
                One school day, one continuous light — 07:10 to vespers
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ THE DAY, IN FULL ============ */}
      <section className="border-y border-[#1f2a44]/12 bg-[#1f2a44] text-[#f5f3ed]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl font-bold leading-tight text-[#d9a441] sm:text-4xl">The day, hour by hour</h2>
          <div className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
            {DAY.map((block, i) => (
              <div key={block.time} className="relative flex flex-col gap-1.5 border-l border-[#f5f3ed]/15 pl-3 first:border-l-0 first:pl-0">
                <block.icon className="h-5 w-5 text-[#d9a441]" strokeWidth={1.6} aria-hidden="true" />
                <p className="text-xs font-bold tracking-widest text-[#f5f3ed]/60">{block.time}</p>
                <p className="text-sm font-semibold leading-tight text-[#f5f3ed]">{block.label}</p>
                <p className="text-[11px] leading-snug text-[#f5f3ed]/60">{block.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TWO DOORS, ONE HOME ============ */}
      <section className="bg-[#f5f3ed]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-[#1f2a44] sm:text-4xl">
            Two doors, one home.<br />
            <span className="text-[#1f2a44]/70">The school teaches. The parish keeps.</span>
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <Link href="/admissions" className="group relative overflow-hidden rounded-2xl bg-[#1f2a44] p-8 text-[#f5f3ed] transition-colors lg:col-span-7">
              <GraduationCap className="h-9 w-9 text-[#d9a441]" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">The Academy door</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#f5f3ed]/80">
                PP1 to Grade 9, day and boarding. Competency-Based Curriculum, daily chapel, national-exam coaching,
                and a waiting list that moves — come and see why families choose us, then apply.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-[#f5f3ed]/75">
                <li>· Admissions for 2027 now open — visits every Saturday</li>
                <li>· Boarding levy KSh 18,000 per term, all-inclusive on school fees</li>
                <li>· KPSEA &amp; KJSEA registration and coaching in-house</li>
              </ul>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-[#d9a441] group-hover:gap-3 group-hover:underline">
                Step through the academy door <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/church" className="group relative overflow-hidden rounded-2xl bg-[#1f4d33] p-8 text-[#eef3ea] transition-colors lg:col-span-5">
              <Church className="h-9 w-9 text-[#d9a441]" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">The Parish door</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#eef3ea]/85">
                Sunday Eucharist at 08:00 and 10:30. Bible study Wednesdays. Men&rsquo;s, women&rsquo;s, youth and mothers&rsquo;
                ministries. The church your family already knows — at All Saints.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-[#d9a441] group-hover:gap-3 group-hover:underline">
                Step through the parish door <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ THE CBC JOURNEY ============ */}
      <section className="border-t border-[#1f2a44]/10 bg-[#efede6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#1f2a44] sm:text-4xl">Ten years, one continuous climb.</h2>
              <p className="mt-3 max-w-md leading-relaxed text-[#1f2a44]/75">
                Kenya&rsquo;s Competency-Based Curriculum, taught properly — not bolted on. Your child moves from
                play-based pre-primary to junior secondary with records, evidence and confidence.
              </p>
              <Link href="/academics" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4 hover:decoration-[#1f2a44]">
                See the full academic pathway <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ol className="grid grid-cols-1 gap-0 sm:grid-cols-2">
              {[
                { band: "PP1—PP2", title: "Pre-Primary", note: "Play, rhythm, story, the anthem sung daily." },
                { band: "Grade 1—6", title: "Primary", note: "Foundations — literacy, numeracy, faith, duty." },
                { band: "Grade 7—9", title: "Junior School", note: "Pre-technical pathways, KPSEA, KJSEA." },
                { band: "Boarding", title: "Life in residence", note: "Dorm duty, exeat passes, prep, Sunday feast. KSh 18,000 per term." },
              ].map((stage) => (
                <li key={stage.band} className="border-t-2 border-[#1f2a44]/20 px-1 py-4 odd:sm:border-r sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f5410]">{stage.band}</p>
                  <p className="mt-1 font-serif text-lg font-bold text-[#1f2a44]">{stage.title}</p>
                  <p className="mt-1 text-sm leading-snug text-[#1f2a44]/70">{stage.note}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ QUESTIONS PARENTS ASK ============ */}
      <section className="bg-[#f5f3ed]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-3xl font-bold leading-tight text-[#1f2a44] sm:text-4xl">Questions parents ask at the gate</h2>
          <p className="mt-2 text-[#1f2a44]/65">Asked a hundred times a term. Answered the same way — plainly.</p>
          <div className="mt-8 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {[
              ["How much are fees?", "Termly fees vary by grade and residency; the boarding levy is KSh 18,000 per term, all-in. We publish the full fee structure at the office and share it on visit day — no hidden lines, ever. (Demo figures shown.)"],
              ["Is my child religious enough for an Anglican school?", "Faith here is caught, not forced — chapel each morning, scripture woven into assemblies, pastoral care for every child. You don't need to be Anglican; you need to want your child formed well."],
              ["Day or boarding — which should we choose?", "Day scholars thrive on routine and family dinners; boarders thrive on full immersion. Come see both on a visit — most families know within an hour."],
              ["What if my child struggles academically?", "Every child has a named teacher, a term-by-term progress conversation, and support before it becomes a crisis. KPSEA and KJSEA are coached in-house, not outsourced."],
              ["How do I apply?", "Book a visit on this page. On visit day we walk you through the fee structure, uniform and dates. The application form takes 20 minutes; acceptance is in writing within two weeks."],
              ["Can we join the parish too?", "The doors are shared. Sunday worship, Bible study and ministry groups all welcome families — school and parish are one house."],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-bold text-[#1f2a44]">
                  {q}
                  <span className="text-[#6f5410] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-2 max-w-3xl leading-relaxed text-[#1f2a44]/80">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE FINAL INVITATION ============ */}
      <section className="relative overflow-hidden bg-[#1f2a44] text-[#f5f3ed]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <p className="font-serif text-4xl font-bold leading-[1.05] sm:text-6xl">
            Bring your child.<br />
            <span className="text-[#d9a441]">See for yourself.</span>
          </p>
          <p className="mx-auto mt-4 max-w-md text-[#f5f3ed]/75">
            Visits every Saturday, 09:00—12:00. Walk the promenade — gate, assembly court, chapel, classrooms.
            The head teacher will ask your child their favourite subject. That is the interview that matters.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#visitor-book"
               className="rounded-md bg-[#d9a441] px-6 py-3 font-serif text-base font-bold uppercase tracking-wide text-[#1f2a44] transition-colors hover:bg-[#e6b654]">
              Sign the visitor book
            </a>
            <a href="tel:+254712000100" className="rounded-md border border-[#f5f3ed]/30 px-6 py-3 text-base font-semibold text-[#f5f3ed] transition-colors hover:border-[#d9a441] hover:text-[#d9a441]">
              +254 712 000 100
            </a>
          </div>
        </div>
      </section>
    </>
  )
}



