import Link from "next/link"
import { Newspaper, ChevronRight } from "lucide-react"

export const metadata = {
  title: "Notices — All Saints Mushililie",
  description: "Term notices from the school and the parish: fee deadlines, term dates, exam registration, works updates. (Illustrative for the demo.)",
}

interface Notice {
  date: string
  tag: "School" | "Parish" | "Fees" | "Works"
  title: string
  body: string
}

const NOTICES: Notice[] = [
  { date: "2026-11-20", tag: "Fees", title: "Term 2 fee deadline — 30 November", body: "Balance reminders go to parents this Friday. M-Pesa Paybill 247 247, account YOUR NAME + FUND. Bring the confirmation SMS to the office or show it on your phone at the gate." },
  { date: "2026-11-24", tag: "School", title: "Grade 6 KPSEA registration opens", body: "Candidates must submit the signed parent consent form and two passport photos by 8 December. Late registration cannot be accepted by KNEC — the office will confirm receipt by SMS." },
  { date: "2026-11-27", tag: "Parish", title: "Second Sunday of Advent — uniforms sale", body: "Second-hand uniform collection SATURDAY 09:00 at the school hall. Fees below KSh 500 per item; WhatsApp list available at the gate." },
  { date: "2026-11-29", tag: "Works", title: "Parish hall foundation — site access", body: "The contractor opens the foundation trench behind the chapel on Monday. Please keep children clear of the works area; the gate route changes for drop-off." },
  { date: "2026-12-01", tag: "School", title: "Term 3 opens 4 January 2027", body: "Report cards are distributed on the last day of term. Parents are reminded to update emergency contacts at the office — phone numbers change, children do not stop needing them." },
  { date: "2026-12-05", tag: "Parish", title: "Confirmation class — 2027 intake", body: "Confirmation classes begin in January for youth in Forms 1–4. Register with the vicar by 15 December; books are provided, attendance is required." },
]

const TAG_STYLE: Record<Notice["tag"], string> = {
  School: "bg-[#1f2a44]",
  Parish: "bg-[#1f4d33]",
  Fees: "bg-[#8a6a1f]",
  Works: "bg-[#6b4a2b]",
}

export default function NoticesPage() {
  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-[#6f5410]" strokeWidth={1.5} aria-hidden="true" />
            <h1 className="font-serif text-4xl font-bold sm:text-6xl">The notice board</h1>
          </div>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#1f2a44]/75">
            Term notices from school and parish — fee deadlines, registration dates, works updates.
            The same list hangs on the gate board every Monday. (Illustrative for the demo.)
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <ul className="divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {NOTICES.map((notice) => (
              <li key={`${notice.date}-${notice.title}`} className="py-5">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className={`inline-flex items-center rounded-sm px-2 py-0.5 font-bold uppercase tracking-wider text-[#f5f3ed] ${TAG_STYLE[notice.tag]}`}>
                    {notice.tag}
                  </span>
                  <time dateTime={notice.date} className="font-semibold text-[#1f2a44]/60">
                    {new Date(notice.date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                </div>
                <h2 className="mt-2 font-serif text-xl font-bold text-[#1f2a44]">{notice.title}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#1f2a44]/75">{notice.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between gap-4 rounded-xl bg-[#1f2a44] p-5 text-[#f5f3ed]">
            <div>
              <p className="font-serif text-lg font-bold">The full newsletter arrives by WhatsApp every Friday.</p>
              <p className="mt-1 text-sm text-[#f5f3ed]/75">Ask the office to add your number to the broadcast list.</p>
            </div>
            <a href="tel:+254712000100" className="shrink-0 rounded-md bg-[#d9a441] px-4 py-2 text-sm font-bold text-[#1f2a44] hover:bg-[#e6b654]">Call the office</a>
          </div>
          <p className="mt-6">
            <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4">
              Prefer dates? See the events calendar <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
