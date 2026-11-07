import Link from "next/link"
import { Church, BookOpen, Users, Music, HeartHandshake, Sprout, Megaphone } from "lucide-react"

export const metadata = {
  title: "The Parish — All Saints Mushililie, Kakamega",
  description: " Sunday Eucharist 08:00 & 10:30, Wednesday Bible study, ministries for every age — the Anglican church your family already knows.",
}

const MINISTRIES = [
  { name: "Sunday Eucharist", when: "Sundays 08:00 & 10:30", note: "Liturgy in English and occasional Kiswahili. Sunday School for children during the 10:30 service.", icon: Church },
  { name: "Bible Study", when: "Wednesdays 18:30", note: "In the chapel or your home group — bring a Bible and a chair.", icon: BookOpen },
  { name: "Men's Guild", when: "First Saturday, 06:30", note: "Breakfast fellowship, estate care, and the duty roster for the school gate.", icon: Users },
  { name: "Women's Guild", when: "Third Saturday, 14:00", note: "Hospital visits, kitchen fund, bursary appeal — the engine of the parish.", icon: HeartHandshake },
  { name: "Choir & Band", when: "Saturdays 16:00", note: "Hymn practice and drum rehearsal; you do not need to sing, just carry the beat.", icon: Music },
  { name: "Youth & Confirmation", when: "Fridays 17:00", note: "For forms 1—4: scripture, service, and a very loud games evening once a term.", icon: Sprout },
  { name: "Announcements", when: "Every Sunday", note: "Notices before the final hymn — visitors, welcomes, prayers, ends.", icon: Megaphone },
]

export default function ParishPage() {
  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12 bg-[#1f4d33] text-[#eef3ea]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-[1.02] sm:text-6xl">The parish door is open. Come and sit with us.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#eef3ea]/90">
            All Saints Mushililie is one house with two doors. The same arch that holds the school day holds
            Sunday worship — children in white, elders in collars, and everyone equally expected at the rail.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a href="tel:+254712000100" className="rounded-md border border-[#eef3ea]/30 px-4 py-2 font-semibold hover:border-[#d9a441] hover:text-[#d9a441]">Call the vicar: +254 712 000 100</a>
            <Link href="/give" className="rounded-md bg-[#d9a441] px-4 py-2 font-bold text-[#1f4d33] hover:bg-[#e6b654]">Give to the work</Link>
          </div>
        </div>
      </section>

      {/* Service times */}
      <section id="services" className="border-b border-[#1f2a44]/12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-3xl font-bold">Service times</h2>
            <dl className="mt-4 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
              {[
                ["Sunday Eucharist", "08:00 & 10:30"],
                ["Sunday School", "During the 10:30 service"],
                ["Bible Study", "Wednesday 18:30"],
                ["Men's Guild", "First Saturday 06:30"],
                ["Choir & Band", "Saturday 16:00"],
                ["Youth & Confirmation", "Friday 17:00"],
              ].map(([name, when]) => (
                <div key={name} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="font-medium">{name}</dt>
                  <dd className="text-right text-sm text-[#1f2a44]/70">{when}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-[#1f2a44]/70">Seasons change times slightly — the notice board at the gate always carries this Sunday&rsquo;s order.</p>
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-serif text-3xl font-bold">Ministries &amp; guilds</h2>
            <ul className="mt-4 divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
              {MINISTRIES.map((m) => (
                <li key={m.name} className="grid grid-cols-12 gap-3 py-4">
                  <m.icon className="col-span-2 h-6 w-6 text-[#1f4d33] sm:col-span-1" strokeWidth={1.5} aria-hidden="true" />
                  <div className="col-span-10 sm:col-span-11">
                    <p className="font-serif text-base font-bold">{m.name} <span className="font-sans text-xs font-medium text-[#6f5410]">· {m.when}</span></p>
                    <p className="mt-0.5 text-sm leading-relaxed text-[#1f2a44]/75">{m.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Invitation */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="rounded-2xl bg-[#1f2a44] p-8 text-[#f5f3ed] sm:p-10">
            <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">First time? Sit near the back.<br /><span className="text-[#d9a441]">Someone will bring you a hymn book.</span></h2>
            <p className="mt-3 max-w-xl text-[#f5f3ed]/80">
              You don&rsquo;t need to know the responses. You don&rsquo;t need to dress up. You need to be willing to sit
              quietly for forty minutes and let the music do what it does.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/events" className="rounded-md bg-[#d9a441] px-5 py-2.5 font-bold text-[#1f2a44] hover:bg-[#e6b654]">See the events calendar</Link>
              <Link href="/about" className="rounded-md border border-[#f5f3ed]/30 px-5 py-2.5 font-semibold text-[#f5f3ed] hover:border-[#d9a441] hover:text-[#d9a441]">The story behind the parish</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



