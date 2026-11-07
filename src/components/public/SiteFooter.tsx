import Link from "next/link"
import { Wordmark } from "./SiteNav"

export function SiteFooter() {
  return (
    <footer className="bg-[#1f2a44] text-[#f5f3ed]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Wordmark light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#f5f3ed]/75">
              An Anglican academy and parish family in Kakamega County — faith formed, minds stretched, character kept.
            </p>
            <a href="tel:+254712000100" className="mt-4 block text-sm font-semibold text-[#d9a441] hover:underline">
              +254 712 000 100
            </a>
            <a href="mailto:info@allsaintsmushililie.ac.ke" className="mt-1 block text-sm text-[#f5f3ed]/80 hover:underline">
              info@allsaintsmushililie.ac.ke
            </a>
          </div>
          <nav className="md:col-span-2" aria-label="School">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">School</p>
            <ul className="mt-3 space-y-2 text-sm text-[#f5f3ed]/80">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
              <li><Link href="/admissions" className="hover:text-white">Admissions</Link></li>
              <li><Link href="/admissions/apply" className="hover:text-white">Apply now</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              <li><Link href="/notices" className="hover:text-white">Notices</Link></li>
            </ul>
          </nav>
          <nav className="md:col-span-2" aria-label="Parish">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Parish</p>
            <ul className="mt-3 space-y-2 text-sm text-[#f5f3ed]/80">
              <li><Link href="/church" className="hover:text-white">Ministries</Link></li>
              <li><Link href="/church#services" className="hover:text-white">Service times</Link></li>
              <li><Link href="/give" className="hover:text-white">Give</Link></li>
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Visit</p>
            <address className="mt-3 text-sm not-italic leading-relaxed text-[#f5f3ed]/80">
              All Saints Mushililie
              <br />P.O. Box 142—50100, Mushililie
              <br />Kakamega County, Kenya
            </address>
            <p className="mt-3 text-xs text-[#f5f3ed]/75">
              Monday—Friday 07:30—17:00 · Saturday 09:00—12:00
              <br />Sunday: worship 08:00 &amp; 10:30 — visitors welcome
            </p>
            <Link href="/contact" className="mt-4 inline-flex rounded-md border border-[#d9a441] px-4 py-2 text-sm font-semibold text-[#d9a441] transition-colors hover:bg-[#d9a441] hover:text-[#1f2a44]">
              Find us &amp; plan a visit
            </Link>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#f5f3ed]/10 pt-6 text-xs text-[#f5f3ed]/75">
          <p>© {new Date().getFullYear()} All Saints Mushililie. A ministry of the Anglican Church of Kenya.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#f5f3ed]">Portal login</Link>
            <Link href="/contact" className="hover:text-[#f5f3ed]">Contact the office</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}


