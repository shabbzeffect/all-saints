---
name: All Saints Mushililie — Academy & Parish (SAINTS public site)
description: An Anglican day/boarding academy and parish in Kakamega County — one continuous act of light, chapel to classroom to duty.
colors:
  whitewash: "#f5f3ed"
  whitewash-deep: "#efede6"
  map-sand: "#e9e6dc"
  chapel-ink: "#1f2a44"
  chapel-ink-hover: "#2a3a5f"
  morning-gold: "#d9a441"
  morning-gold-hover: "#e6b654"
  chapel-gold: "#e9bc55"
  gold-deep: "#6f5410"
  stained-ruby: "#8e2a3c"
  timber-walnut: "#6b4a2b"
  parish-green: "#1f4d33"
  parish-mist: "#eef3ea"
typography:
  display:
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.08
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  "4": "1rem"
  "6": "1.5rem"
  "10": "2.5rem"
  "12": "3rem"
  "14": "3.5rem"
  "16": "4rem"
components:
  button-gold:
    backgroundColor: "{colors.morning-gold}"
    textColor: "{colors.chapel-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-gold-hover:
    backgroundColor: "{colors.morning-gold-hover}"
    textColor: "{colors.chapel-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ink:
    backgroundColor: "{colors.chapel-ink}"
    textColor: "{colors.whitewash}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ink-hover:
    backgroundColor: "{colors.chapel-ink-hover}"
    textColor: "{colors.whitewash}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.whitewash}"
    textColor: "{colors.chapel-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  visitor-book:
    backgroundColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "20px"
  door-academy:
    backgroundColor: "{colors.chapel-ink}"
    textColor: "{colors.whitewash}"
    rounded: "{rounded.2xl}"
    padding: "32px"
  door-parish:
    backgroundColor: "{colors.parish-green}"
    textColor: "{colors.parish-mist}"
    rounded: "{rounded.2xl}"
    padding: "32px"
  site-nav:
    backgroundColor: "rgba(245,243,237,0.9)"
    textColor: "{colors.chapel-ink}"
---

# Design System: All Saints Mushililie — Academy & Parish

## Overview

**Creative North Star: "The Chapel in Morning Light"** — the school as one continuous act of light, chapel to classroom to duty.

The shipped public world (`src/app/(public)/*`, `src/components/public/*`, `src/app/globals.css`) is a chapel at 7:10 a.m., not a brochure: a cool whitewash ground, deep chapel ink, timber walnut, and morning gold used only as light. The category default (photo-collage hero + three icon cards) and the cream-brochure rendition were rejected outright; in their place a full-height "nave" first viewport pairs the word and the visitor-book form on the left with a stained-glass school-day ribbon on the right, and every page after deepens the same offer — book a visit. Serif in full ink contrast; humanist system sans for the reader; crisp edges and working parts, never fog, never haze.

Anglican identity is non-negotiable in tone — reverent, warm, community-rooted; never corporate or salesy. All content is labelled illustrative demo copy, swappable without layout change. The public route group renders without `PortalShell`; signed-in users are handed to `/login`. Light Kiswahili is welcome where natural.

**Key Characteristics:**
- One continuous act of light: the ribbon, the hairline arch, gold as scarce light (CTA, icons, underlines, selection), never as decorative wash
- Full ink contrast on whitewash; nothing fogged
- Ledger rows and dividing hairlines instead of card grids
- Georgia-class serif voices the institution; system sans serves the reader
- Two shadows in the entire system, ever
- Authored SVG geometry only (arch, crest, map, ribbon) — no photographs ship

## Colors

Chapel stone at first light: near-whitewash, ink shadow, and one hour of gold.

### Primary
- **Chapel Ink** (#1f2a44): body text, dark bands and panels, footer, table heads, wordmark fill, events date badges, selected filter pills. Hover deepens to #2a3a5f (contact submit).
- **Morning Gold** (#d9a441): the one warm accent — gold CTAs (#e6b654 on hover), icons on dark, 2px link underlines, `::selection` (gold bg, ink text), focus rings (`#d9a441` at 40%). On ink it reads ~6.3:1 and may carry bold text.
- **Chapel Gold** (#e9bc55): the ribbon's 07:30 Chapel shaft and its gradient terminus (#c98f1e); also the gold used inside the map doorway.
- **Deep Gold** (#6f5410): small-caps labels and band markers on light ground (AA at 10–12px); the dark enough gold that carries text on whitewash.

### Secondary
- **Parish Green** (#1f4d33): the parish door panel, the church hero band, bursary callouts, give-page progress fills. Pairs with **Parish Mist** (#eef3ea) text.
- **Timber Walnut** (#6b4a2b): the map's primary block (stroke #3d2812); deepens the map's material story.

### Tertiary
- **Stained Ruby** (#8e2a3c): reserved — the ribbon's 07:10 Flag terminus (#c94a3a→#8e2a3c) and the visitor-book error message. Nothing else. Rare is the point.

### Neutral
- **Whitewash** (#f5f3ed): the ground of every page; **Whitewash Deep** (#efede6): the CBC-journey band.
- **Map Sand** (#e9e6dc): campus map ground (courtyard #ddd8c8, path #c9c2af, boundary dashed `10 8`).
- **White** (#ffffff): form fields, table bodies, the visitor-book card.

**The Gold-As-Light Rule.** On light grounds gold (#d9a441) is graphics only — icons, underlines, dots, the 1px form under-edge — because it sits near 2:1 on whitewash. Small-caps text on light uses Deep Gold (#6f5410). Gold carries bold text only on dark grounds (ink, green).

**The Rare Ruby Rule.** Ruby appears exactly twice in the system: the ribbon's flag shaft terminus and the visitor-book error line. Adding a third use is a system violation, not a palette extension.

**The 12-to-1 Rule.** Ink on whitewash computes to roughly 12.8:1. Keep primary text there, secondary ink text at ≥/70 opacity (≈5:1), and reserve /60–/65 for genuinely non-essential print. The finish review signed off this floor; do not thin it further.

## Typography

**Display Font:** Georgia-class serif — `font-serif` resolves to `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`; Georgia is the effective face
**Body Font:** system sans — `font-sans` → `var(--font-inter)` → `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
**No webfonts, ever.** The brief forbids external font/image requests; system stacks only.

**Character:** the serif is the institution speaking — the wordmark, the headline, the questions parents ask, the visitor book. The sans is the reader being served — proof lines, data, table cells, labels.

### Hierarchy
- **Display** (700, `text-5xl sm:text-6xl xl:text-7xl`, line-height 0.98, tracking -0.03em): hero only — "Faith. Mind. Character." plus the serif-italic dek ("One school day, one family — at All Saints.").
- **Headline** (700, page h1 `text-4xl sm:text-6xl leading-[1.02]`; section h2 `text-3xl sm:text-4xl leading-tight`): one h1 per page, always serif.
- **Title** (700, `text-lg`–`text-2xl` serif): card titles, FAQ questions, table headers, the visitor-book heading.
- **Body** (400, 1rem/1.625): proof lines and notes; measure held to ~52–75ch (`max-w-md`…`max-w-3xl`).
- **Label** (600–700, 10–12px, uppercase, tracking 0.18–0.24em): form labels, band markers, figcaption, footer column heads — `#6f5410` on light, `#d9a441` on dark.

**The Two Voices Rule.** Serif names; sans serves. Never set long-form body in serif; never set the wordmark or display lines in sans.

## Layout

- Container `max-w-7xl` with `px-4 sm:px-6`; section rhythm `py-12`/`py-14`/`py-16`. Breakpoints in use: `sm` 640, `lg` 1024, `xl` 1280 (plus `md` 768 in one ledger). `lg` is the structural break: the nave unfurls, 12-column ledgers engage.
- **The nave.** First viewport is a 12-col grid (7 word+form / 5 ribbon) on whitewash; a hairline arch SVG sits behind everything at 5% opacity. The offer is never trapped: the complete visitor book is visible in the first viewport at every breakpoint (mobile stacks word → form → promenade steps → ribbon).
- **Ledger grammar.** Rows divided by hairlines (`divide-y divide-[#1f2a44]/12`, `border-y`) instead of card grids — admissions steps, values, leadership, FAQ, give, parish lists. 12-col grids carry number — icon — text.
- **Page skeleton.** Every page opens with a serif h1 + one proof line, and every page ends on the visit invitation (home: ink closing band with gold CTA; admissions/contact/church: embedded visitor book or `tel:` CTA; footer: gold-outline "Find us & plan a visit").
- **Mobile:** single column; nav collapses to a disclosure (`Menu`/`X`, `aria-expanded`); the ribbon sits below the form; touch targets ≥44px.
- `::selection` is gold on ink-colored text, from `globals.css`.

## Elevation & Depth

Depth is tonal (whitewash → ink), plus exactly two shadows in the whole system. Surfaces are flat at rest; nothing lifts on hover.

### Shadow Vocabulary
- **Ambient stained glass** (`0 24px 60px -24px rgba(31,42,68,0.55)`): the one deep ambient lift; bound to the home ribbon panel.
- **Visitor-book under-edge** (`0 1px 0 0 #d9a441`): a 1px gold resting line under the form card — a light seam, not a drop shadow.

**The Two Shadows Rule.** A third shadow is a bug. Focus is expressed with the gold ring (`focus:ring-2 ring-[#d9a441]/40` + border shift), never with shadow; disabled state is 60% opacity.

## Shapes

The recurring silhouette is the **arch**: the hero's 5% hairline arch, the ribbon's arch-top (`border-radius: 50% 50% 0 0 / 14%`), the chapel glyph in the map. Forms are drawn, never rendered as photo stand-ins — the site ships zero raster imagery; every visual is authored SVG or CSS geometry.

- Radii in use: `md` 6px (buttons, inputs, fields), `lg` 8px (event date badges, map callouts), `xl` 12px (visitor book, tables, image-like panels), `2xl` 16px (door panels, map figure, invitation/enclosure panels), `full` (promenade dots, filter pills, progress bars).
- Hairline borders `#1f2a44/10`–`/25`; dark bands use `#f5f3ed/10`; the map boundary is dashed `10 8`.
- Beams, arches and joints are drawn honestly: crisp vector shapes and linework only. No `feTurbulence` grain, no sketch strokes, no geometric masks approximating photos.

## Components

### SiteNav
Sticky, `backdrop-blur`, `rgba(245,243,237,0.9)` ground, 1px `#1f2a44/10` bottom border. Wordmark: crest SVG (ink circle, 2px gold ring, whitewash cross; light variant swaps — gold fill, ink ring, ink cross) + "All Saints Mushililie" (serif bold 18px) over "ACADEMY & PARISH" (9px caps, 0.22em, `#6f5410` / `#d9a441` on dark). Links 14px medium, `/70` at rest, active = ink with 2px gold underline offset 4px. "Portal login" is a 1px ink outline button that inverts to ink/whitewash on hover — never gold; gold belongs to the door CTAs. Mobile: disclosure button, aria-expanded, stacked list + "Portal login →".

### SiteFooter
Ink slab (`#1f2a44`), 12-col grid: wordmark (light) + tel/email; "School" / "Parish" / "Visit" columns headed by 10px gold caps (0.2em); `whitewash/75–80` body; gold-outline "Find us & plan a visit" CTA inverts to gold/ink on hover. Bottom bar: hairline `#f5f3ed/10`, copyright + "A ministry of the Anglican Church of Kenya", Portal login + Contact the office.

### The visitor book (VisitForm)
The conversion instrument and the signature component. White `rounded-xl` card, 1px `#1f2a44/15` border, 1px gold under-edge. Serif bold heading "Sign the visitor book"; 10px caps labels (`#1f2a44/70`); fields on whitewash ground, hairline borders, focus = `#d9a441` border + 2px `#d9a441/40` ring; error text stained ruby. Submit: gold (#d9a441→#e6b654), serif bold uppercase ink label ("Book our school visit" / "Signing the book…" with spinner), disabled at 60% opacity. Success: ink panel, gold `CheckCircle2`, role="status", "Asante, {first name}." Demo submissions land in `localStorage` only — labelled as such, nothing leaves the device. Compact variant (`p-4`) on admissions.

### The stained-glass school-day ribbon (home)
Arch-topped figure (`50% 50% 0 0 / 14%`), 2px `#1f2a44/25` border, the one deep shadow. Seven shafts in fixed chronological order, each a 160° gradient `from→to`, hour (10px bold caps, opacity 90) left, name (serif bold caps, 0.12em) right: 07:10 Flag `#c94a3a→#8e2a3c` · 07:30 Chapel `#e9bc55→#c98f1e` (ink-dark text `#241703`) · 08:00 Lessons `#1e6d82→#0e3f4f` · 10:30 Play `#2e6b4f→#1f4d33` · 13:00 Duty `#8a6a42→#4a3220` · 15:30 Games & clubs `#4b5aa8→#232c5e` · 17:00 Vespers `#6a4a8a→#33204f`. Haptic-free, one-shot motion: the **Chapel shaft runs `ribbon-glow` once on load** (opacity 0.55→1→0.92 + saturate/brightness, 2.6s `ease-out`, 0.4s delay); **one shimmer sweep** (`ribbon-shimmer`, 3.2s `cubic-bezier(0.22,1,0.36,1)`, 0.8s delay, 33%-width white gradient) crosses the glass once. Caption below: "One school day, one continuous light — 07:10 to vespers" (10px caps, 0.24em). Under `prefers-reduced-motion: reduce` both animations are disabled (`globals.css`). The shimmer layer is `aria-hidden`; shaft text is real text.

### Door panels (home)
Two oversized `Link`s: **Academy door** — ink ground, gold `GraduationCap`, serif 2–3xl title, gold underline-less CTA "Step through the academy door" → `/admissions`. **Parish door** — green ground (#1f4d33), gold `Church`, same anatomy → `/church`. Both `rounded-2xl`, arrow nudge on hover.

### The day, hour by hour (home)
Ink band; 7-col grid (2/4/7 responsive); gold icons (1.6 stroke), time whitewash/60, label whitewash semibold, note whitewash/60 — a deliberately quiet tier for notes-only text.

### FAQ
`<details>/<summary>`, serif bold question, "+" (aria-hidden) rotating 45° on open in `#6f5410`; hairline-divided; answer measure `max-w-2xl–3xl`.

### Campus map (contact)
Authored SVG, `viewBox 0 0 760 480`, `#e9e6dc` ground, rounded-2xl. Dashed outer boundary + GATE; seven stops as keyboard-focusable `<g tabindex="0" role="img">` groups, each with `<title>` + `aria-label` (Gate, Assembly Courtyard, Chapel, Primary Block, Junior School, Dining Hall, Playing Field). Hover **and** `:focus-visible` swap the shape stroke to gold at 3px. Stowed-to-one-way map: no external tiles, ever.

### Buttons
- **Gold (primary CTA):** `#d9a441` → `#e6b654` hover, ink serif bold uppercase label, radius 6px, `py-2.5 px-4`. Home final band, visitor book, give page.
- **Ink:** `#1f2a44` → `#2a3a5f` hover, whitewash sans semibold label — contact form submit.
- **Outline on dark:** 1px `#f5f3ed/30`, whitewash text; hover → gold border + gold text (church hero, final band).
- **Underline-link:** ink text, 2px gold underline offset 4px; hover → ink underline (in-page navigation).
- **Footer gold-outline:** `#d9a441` border + text; hover fills gold with ink text.

### Chips / filters (events)
Pill buttons, hairline `#1f2a44/25` outline; selected = ink fill, whitewash text; `role="tablist"` / `role="tab"` with `aria-selected`. Date badges: ink rounded-lg tile, serif 2xl gold day over 10px caps whitewash month.

### Tables (academics, admissions)
Ink `thead` with whitewash text; white `tbody`; hairline `divide-y`; `rounded-xl overflow-hidden border`. No zebra.

### Progress bars (give)
Track `#1f2a44/12`, fill `#1f4d33`, `role="progressbar"` with `aria-valuenow/min/max/label`; labelled illustrative.

## Do's and Don'ts

### Do:
- **Do** carry body text as ink on whitewash (≈12.8:1); secondary ink at ≥/70 (≈5:1); Deep Gold `#6f5410` for small-caps on light.
- **Do** keep gold as light — on dark grounds for bold CTAs and icons; on light grounds for icons, underlines, focus rings, `::selection`, and the visitor-book 1px under-edge.
- **Do** end every page on the visit invitation; keep the visitor book reachable in the first viewport; never link the offer away to another page.
- **Do** draw ornament as honest geometry — arch, crest, chapel map, ribbon — as CSS/SVG only.
- **Do** divide ledgers with hairlines (`#1f2a44/10`–`/12`), not cards; rows over grids.
- **Do** label demo figures illustrative and keep them swappable without layout change; no invented dates, founding stories, or staff.
- **Do** keep keyboard focus visible everywhere: gold ring on fields, gold stroke on map spots, `aria-current` in nav, `role="status"` on the visitor-book success panel.
- **Do** keep the two shipped shadows only; focus and disabled are ring/opacity, not elevation.
- **Do** respect `prefers-reduced-motion` — ribbon glow and shimmer are disabled, not slowed.

### Don'ts:
- **Don't** introduce a second accent hue or reuse ruby outside its two sanctioned uses (ribbon flag terminus, visitor-book error).
- **Don't** set gold `#d9a441` text on whitewash (≈2:1) — not for labels, not for "accent" words; that is what Deep Gold is for.
- **Don't** ship external fonts, images, map tiles, or CDN assets — the system renders from system stacks and authored SVG alone.
- **Don't** wrap public pages in `PortalShell`, and don't style Portal login as a gold CTA — it is a quiet ink outline.
- **Don't** add a kicker/eyebrow above any heading, gradient text, or icon-card grids — the heading carries its own weight; ledger rows carry the content.
- **Don't** add a third shadow, hard offset shadows, or a 1px border under a wide soft shadow (ghost card).
- **Don't** present illustrative content as fact (fees, dates, history, counts) — it stays labelled; the finish review shipped it that way.
- **Don't** reorder or recolour the seven ribbon shafts — they are the school day, 07:10 to vespers, in order.
- **Don't** put the serif on long-form body copy or the sans on the wordmark/display lines.
- **Don't** let secondary text thin below /70 opacity when it carries meaning — the /60 tier is for notes and non-essential print only.

---

*Source of truth: `src/app/(public)/*.tsx`, `src/components/public/*.tsx`, `src/app/globals.css`, `tailwind.config.ts`. Visual reference: `.impeccable/review/*-{desktop,mobile}.png` (finish review, DISPOSITION: ship). This document records the shipped world, not alternate directions. Portal (Operate surfaces) is out of scope.*
