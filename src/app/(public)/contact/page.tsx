"use client"

import { PhoneCall, Mail, Clock, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [subject, setSubject] = useState("Visit enquiry")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const mailto = `mailto:info@allsaintsmushililie.ac.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`

  return (
    <div className="bg-[#f5f3ed]">
      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="font-serif text-4xl font-bold sm:text-6xl">Find us on the Kakamega road.</h1>
          <p className="mt-3 max-w-2xl text-[#1f2a44]/75">
            All Saints Mushililie sits on the Kakamega road with its own gate — blue arch, white lettering,
            geese if it is a good morning. P.O. Box 142–50100, Mushililie, Kakamega County.
          </p>
        </div>
      </section>

      <section className="border-b border-[#1f2a44]/12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
          {/* Campus map — authored SVG, no external tiles */}
          <figure className="lg:col-span-7">
            <svg viewBox="0 0 760 480" role="img" aria-label="Stylised map of the All Saints Mushililie campus" className="w-full rounded-2xl border border-[#1f2a44]/15 bg-[#e9e6dc] [&_g.map-spot]:cursor-pointer [&_g.map-spot_.map-shape]:transition-all [&_g.map-spot:hover_.map-shape]:stroke-[#d9a441] [&_g.map-spot:hover_.map-shape]:stroke-[3] [&_g.map-spot:focus-visible_.map-shape]:stroke-[#d9a441] [&_g.map-spot:focus-visible_.map-shape]:stroke-[3]">
              {/* outer boundary + gate */}
              <rect x="20" y="20" width="720" height="440" rx="10" fill="none" stroke="#1f2a44" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="10 8" />
              <g className="map-spot" tabIndex={0} role="img" aria-label="The Gate — enter here, blue arch, white lettering">
                <title>The Gate — enter here, blue arch, white lettering</title>
                <rect className="map-shape" x="330" y="440" width="100" height="26" fill="#e9e6dc" stroke="#1f2a44" strokeWidth="2" />
                <text x="380" y="457" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f2a44">GATE</text>
              </g>

              {/* path */}
              <path d="M380 440V300H240M380 440V300H560" stroke="#c9c2af" strokeWidth="26" fill="none" strokeLinecap="round" />

              {/* assembly courtyard */}
              <g className="map-spot" tabIndex={0} role="img" aria-label="Assembly Courtyard — morning flag, roll call and the announcements">
                <title>Assembly Courtyard — morning flag, roll call and the announcements</title>
                <circle className="map-shape" cx="380" cy="300" r="46" fill="#ddd8c8" stroke="#1f2a44" strokeOpacity="0.5" strokeWidth="2" />
                <text x="380" y="304" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1f2a44">COURT</text>
              </g>

              {/* chapel */}
              <g className="map-spot" tabIndex={0} role="img" aria-label="The Chapel — daily assembly at 07:30, Sunday Eucharist 08:00 and 10:30">
                <title>The Chapel — daily assembly at 07:30, Sunday Eucharist 08:00 and 10:30</title>
                <path className="map-shape" d="M360 180 L380 140 L400 180 Z" fill="#1f2a44" stroke="#1f2a44" strokeWidth="2" />
                <rect className="map-shape" x="352" y="180" width="56" height="60" fill="#1f2a44" stroke="#1f2a44" strokeWidth="2" />
                <path d="M372 240 v-26 a8 8 0 0 1 16 0 v26 Z" fill="#d9a441" />
                <text x="380" y="133" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1f2a44">CHAPEL</text>
              </g>

              {/* primary block */}
              <g className="map-spot" tabIndex={0} role="img" aria-label="Primary Block — Grade 1 to 6, CBC foundations">
                <title>Primary Block — Grade 1 to 6, CBC foundations</title>
                <rect className="map-shape" x="70" y="175" width="150" height="80" fill="#6b4a2b" stroke="#3d2812" strokeWidth="2" />
                <text x="145" y="219" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f5f3ed">PRIMARY</text>
              </g>

              {/* junior school */}
              <g className="map-spot" tabIndex={0} role="img" aria-label="Junior School — Grade 7 to 9, pre-technical pathways">
                <title>Junior School — Grade 7 to 9, pre-technical pathways</title>
                <rect className="map-shape" x="540" y="175" width="150" height="80" fill="#1f4d33" stroke="#0e2b1b" strokeWidth="2" />
                <text x="615" y="219" textAnchor="middle" fontSize="11" fontWeight="700" fill="#eef3ea">JUNIOR</text>
              </g>

              {/* dining hall */}
              <g className="map-spot" tabIndex={0} role="img" aria-label="Dining Hall — every child fed before lessons resume">
                <title>Dining Hall — every child fed before lessons resume</title>
                <rect className="map-shape" x="70" y="330" width="130" height="70" fill="#8a6a1f" stroke="#4f3b10" strokeWidth="2" />
                <text x="135" y="369" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f5f3ed">DINING</text>
              </g>

              {/* playing field */}
              <g className="map-spot" tabIndex={0} role="img" aria-label="Playing Field — rugby, netball, athletics and clubs from 15:30">
                <title>Playing Field — rugby, netball, athletics and clubs from 15:30</title>
                <ellipse className="map-shape" cx="600" cy="395" rx="95" ry="42" fill="#3f8a5f" fillOpacity="0.55" stroke="#1f4d33" strokeWidth="2" />
                <text x="600" y="399" textAnchor="middle" fontSize="11" fontWeight="700" fill="#123324">FIELD</text>
              </g>
            </svg>
            <figcaption className="mt-2 text-xs text-[#1f2a44]/70">Stylised for the demo — the gate, the court, the chapel, the classrooms. Come and walk it.</figcaption>
          </figure>

          {/* Contact cards + form */}
          <div className="lg:col-span-5">
            <ul className="divide-y divide-[#1f2a44]/12 border-y border-[#1f2a44]/12">
              <li className="py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5410]"><PhoneCall className="h-4 w-4" aria-hidden="true" />Call</p>
                <a href="tel:+254712000100" className="mt-1 block font-serif text-xl font-bold text-[#1f2a44] hover:underline">+254 712 000 100</a>
                <p className="text-xs text-[#1f2a44]/70">Office, Mon–Fri 07:30–17:00 · Sat 09:00–12:00</p>
              </li>
              <li className="py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5410]"><Mail className="h-4 w-4" aria-hidden="true" />Email</p>
                <a href="mailto:info@allsaintsmushililie.ac.ke" className="mt-1 block font-serif text-xl font-bold text-[#1f2a44] hover:underline">info@allsaintsmushililie.ac.ke</a>
                <p className="text-xs text-[#1f2a44]/70">Replies within one working day</p>
              </li>
              <li className="py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5410]"><Clock className="h-4 w-4" aria-hidden="true" />Sunday</p>
                <p className="mt-1 text-[#1f2a44]/75">Worship at 08:00 &amp; 10:30 — the gate is open and the kettle is on.</p>
              </li>
            </ul>

            <form onSubmit={(e) => { e.preventDefault(); setSent(true); window.location.href = mailto }} className="mt-6 rounded-xl border border-[#1f2a44]/12 bg-white p-5">
              <p className="font-serif text-lg font-bold">Write to the office</p>
              <label htmlFor="c-subject" className="mt-3 mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70">Subject</label>
              <select id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm outline-none focus:border-[#d9a441]">
                <option>Visit enquiry</option>
                <option>Admissions 2027</option>
                <option>Fees &amp; bursary support</option>
                <option>Boarding residence</option>
                <option>The parish &amp; ministries</option>
                <option>Other</option>
              </select>
              <label htmlFor="c-message" className="mt-3 mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1f2a44]/70">Message</label>
              <textarea id="c-message" rows={3} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your name, phone and what you need…" className="w-full rounded-md border border-[#1f2a44]/15 bg-[#f5f3ed] px-3 py-2 text-sm outline-none placeholder:text-[#1f2a44]/70 focus:border-[#d9a441]" />
              <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1f2a44] px-4 py-2.5 font-semibold text-[#f5f3ed] transition-colors hover:bg-[#2a3a5f]">
                <Send className="h-4 w-4" aria-hidden="true" /> Send to the office
              </button>
              {sent && <p className="mt-2 text-center text-xs text-[#1f4d33]">Your mail app should have opened. If not, call +254 712 000 100.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}


