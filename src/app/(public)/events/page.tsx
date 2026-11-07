"use client"

import Link from "next/link"
import { useState } from "react"
import { MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/config"

type Category = "All" | "School" | "Parish" | "Visits"

interface PublicEvent {
  day: string
  month: string
  title: string
  time: string
  place: string
  category: Exclude<Category, "All">
}

const EVENTS: PublicEvent[] = [
  { day: "08", month: "Nov", title: "Sunday Eucharist & Sermon", time: "08:00 & 10:30", place: "The Chapel", category: "Parish" },
  { day: "12", month: "Nov", title: "Choir Rehearsal", time: "18:30", place: "Parish Hall", category: "Parish" },
  { day: "14", month: "Nov", title: "Grade 6 KPSEA Prep Evening for Parents", time: "16:00—18:00", place: "Junior School Block", category: "School" },
  { day: "15", month: "Nov", title: "Admission Visit — Walk the Promenade", time: "09:00—12:00", place: "School Gate", category: "Visits" },
  { day: "16", month: "Nov", title: "Bible Study (Wednesday)", time: "18:30", place: "Chapel / Home Groups", category: "Parish" },
  { day: "22", month: "Nov", title: "Youth Outreach — Kibra Clinic Day", time: "07:00 departure", place: "School Parking", category: "Parish" },
  { day: "29", month: "Nov", title: "Admission Visit — Saturday Open Morning", time: "09:00—12:00", place: "School Gate", category: "Visits" },
  { day: "05", month: "Dec", title: "Prize Giving & Carol Service", time: "15:00", place: "The Chapel", category: "School" },
  { day: "06", month: "Dec", title: "Sunday Eucharist — Advent 1", time: "08:00 & 10:30", place: "The Chapel", category: "Parish" },
  { day: "13", month: "Dec", title: "Manual of Uniform Sale (Second-hand)", time: "09:00", place: "School Hall", category: "School" },
]

const FILTERS: Category[] = ["All", "School", "Parish", "Visits"]

export default function EventsPage() {
  const [filter, setFilter] = useState<Category>("All")
  const visible = EVENTS.filter((e) => filter === "All" || e.category === filter)

  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="font-serif text-4xl font-bold sm:text-6xl">What the calendar holds</h1>
          <p className="mt-3 max-w-2xl text-[#1f2a44]/75">
            School, parish and open-morning dates. Illustrative for the demo — the notice board at the gate
            always carries the truth for this Sunday.{" "}
            <Link href="/notices" className="font-semibold text-[#1f2a44] underline decoration-[#d9a441] decoration-2 underline-offset-4 hover:decoration-[#1f2a44]">
              The full notice board →
            </Link>
          </p>
          <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter events">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  filter === f
                    ? "border-[#1f2a44] bg-[#1f2a44] text-[#f5f3ed]"
                    : "border-[#1f2a44]/25 text-[#1f2a44]/75 hover:border-[#1f2a44]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <ul className="divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
            {visible.map((event) => (
              <li key={`${event.day}-${event.title}`} className="grid grid-cols-12 items-center gap-4 py-4">
                <div className="col-span-2 sm:col-span-1">
                  <div className="rounded-lg bg-[#1f2a44] px-2 py-2 text-center">
                    <p className="font-serif text-2xl font-bold leading-none text-[#d9a441]">{event.day}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase text-[#f5f3ed]/80">{event.month}</p>
                  </div>
                </div>
                <div className="col-span-7 sm:col-span-8">
                  <p className="font-serif text-lg font-bold leading-snug text-[#1f2a44]">{event.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-[#1f2a44]/75">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{event.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{event.place}</span>
                  </p>
                </div>
                <p className="col-span-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f5410] sm:col-span-3">{event.category}</p>
              </li>
            ))}
          </ul>
          {visible.length === 0 && <p className="py-10 text-center text-[#1f2a44]/70">Nothing on the board for that category yet — check the gate.</p>}
        </div>
      </section>
    </div>
  )
}

