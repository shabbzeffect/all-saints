# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: parents evaluating admission to All Saints Mushililie Academy — from the moment they first hear the school's name through open days, application, and first fee invoice. Secondary: parishioners of the Anglican Parish of All Saints Mushililie checking service times, events and giving; current families managing portal access and notices.

## Product Purpose

SAINTS is the school & parish management platform for All Saints Mushililie (All Saints Mushililie Academy, Kakamega County, Kenya). The public website exists to help prospective parents decide to apply: communicate what the academy is (an Anglican day/boarding pre-primary to junior school), its academic and faith life, its admissions process, and its community — and convert that interest into an application enquiry. The portal (separate experience) serves enrolled families, staff and parish leadership.

## Positioning

An Anglican academy pairing faith formation with academic excellence under Kenya's Competency-Based Curriculum (CBC) — PP1–PP2 through Junior School (Grade 7–9), with character formation and a nurturing family culture, uncommon among boarding options in the Kakamega area.

## Operating Context

The institution runs on SAINTS (Next.js 14, this repository): school management, parish administration, finance, library, boarding, transport — an internal portal at /login. The public site ships inside the same app as a public route group with its own layout and no auth. Domain facts mirrored in the product: allsaintsmushililie.ac.ke, Kakamega County, swahili/English context, M-Pesa as the everyday payment rail, Kenyan academic year and term structure.

## Capabilities and Constraints

- Illustrative demo content: no real history, photos, staff names or testimonials exist yet. All copy, imagery and figures are clearly illustrative placeholders structured so real content can replace them without layout change. Do not invent award lists, founding dates, or verifiable claims; keep them modest and generic ("since the founding congregation..." style only where safe) or visibly placeholder.
- Portal and public site share the same deployment; the public site must not require authentication and must link signed-in users to the portal (/login).
- Phone/WhatsApp contact, M-Pesa/paybill, email and physical visit are the real conversion paths; there is no CRM behind the site today — enquiries route to the office by phone/email/form-mailto.
- Languages: English first, with Kenyan cultural context; Kiswahili liturgical/community terms welcome where natural (e.g., in parish sections).

## Brand Commitments

- Name: "SAINTS" / "All Saints Mushililie" — school: "All Saints Mushililie Academy"; parish: Anglican Parish of All Saints Mushililie.
- Established visual identity in this repo: navy/anglican blue (#1e3a8a family), gold accent (#f59e0b family), serif display type for the wordmark, anglican purple for parish-facing accents, anglican green for success/community accents. Tailwind tokens in tailwind.config.ts.
- Anglican identity is non-negotiable in tone: reverent, warm, community-rooted — never corporate or salesy.

## Evidence on Hand

- Repository evidence only: schema, seed data (illustrative, `prisma/seed.ts` — fee lines incl. boarding KSh 18,000; grades PP1–Grade 9; Kakamega location), portal UI, brand tokens.
- No photographs, crest artwork, founding story, staff profiles, testimonial quotes, or press coverage exist. Nothing may be presented as real evidence; use marked illustration.

## Product Principles

1. Faith with substance: every page should show what formation looks like, not just claim it.
2. Decide with confidence: a parent leaves knowing fees shape, grades offered, admissions steps, and how to visit — no dead ends.
3. Family first: the academy is small enough to know your child by name — design accordingly, never institutional-poster tone.
4. One site, two vocations: school and parish are sibling institutions of one Anglican family; present both with equal care, school leading.
5. Honesty in placeholders: demo content stays humble and generic until real material arrives; no fabricated proof.

## Accessibility & Inclusion

No product-specific standard declared. Build to sane defaults: semantic headings, sufficient contrast using existing tokens, keyboard navigable, alt text on imagery, readable body sizes (16px+), and reduced-motion-safe animation.
