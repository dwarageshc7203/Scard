# Scard — Figma Design Prompt

## Project summary

Scard is a developer profile aggregator. Users log in with Google, link their
usernames from coding platforms (GitHub, LeetCode, Codeforces, HackerRank),
and get a single shareable profile page showing a contribution heatmap and
platform badges. Each user's profile is also reachable at a personal
subdomain (e.g. `username.scard.app`).

Design two pages only: a **Landing Page** and a **Profile Page** (the profile
page has two layout variants — see below). Keep the entire product to these
two page types; do not add extra pages, modals-as-pages, or settings screens
unless explicitly asked.

## Design language

**Style:** Swiss / International Typographic Style — content-first,
grid-driven, generous whitespace, no decorative elements, no gradients, no
drop shadows beyond the subtlest separation, no illustrations or icons
unless functional. Every element on screen should justify its presence.

**Typeface:** Inter, used as the only typeface in the product.
- Headings: Inter, 600–700 weight
- Body copy: Inter, 400 weight
- Labels / metadata (timestamps, tags, section eyebrows): Inter, 500 weight,
  smaller size, uppercase with slight letter-spacing — this is a signature
  Swiss-design detail, use it for things like "JOINED 15 DAYS AGO" or
  section labels like "CONTRIBUTIONS"

**Color:** Restrained, not sterile.
- Background: near-black (`#0A0A0A`) for dark mode as the primary theme;
  design a light-mode variant afterward using near-white (`#FAFAFA`), not
  pure white
- Text: high-contrast off-white / near-black, with a secondary gray for
  metadata and de-emphasized text
- One accent color only, used sparingly — active nav state, links, focus
  rings, the "online/active" status dot. Suggest a single confident color
  (e.g. a warm amber or electric blue) rather than a full palette
- Heatmap intensity uses its own 5–6 step scale from "no activity"
  (background-matching, near-invisible) to "high activity" (full accent
  saturation) — this should read clearly in both light and dark themes

**Grid & spacing:**
- 8px base spacing unit (4px for the tightest icon/label gaps)
- 12-column grid on desktop, single column stack on mobile
- Content max-width ~1200–1280px, centered, with generous outer margins
- Nothing should touch the viewport edge on desktop

**Reference for tone:** https://notesnips.vercel.app/ — study its restraint:
one clear headline, one clear subheading, one CTA, a real product screenshot
as the hero's centerpiece, a simple 3-column feature grid below, minimal
footer. Match this level of restraint, not its literal content.

## Component library (build these first, as reusable components with variants)

1. **Avatar** — circular image, sizes: small (list item), large (profile
   header). Optional tiny status/mood indicator in the bottom-right corner.
2. **Sidebar list item** — avatar + name + metadata line (e.g. "Joined 15
   days ago"), with default/hover/active/selected states as variants.
3. **Tab group** — horizontal tabs (e.g. Activity / New / A–Z), underline
   indicator for the active tab, no filled pill background.
4. **Search input** — minimal border or bottom-line only, placeholder text,
   optional trailing keyboard-shortcut hint pill (e.g. "⌘K").
5. **Heatmap cell** — single square/rounded-square, 5–6 color-intensity
   variants, small enough to tile ~365 of them in a year grid with visible
   week/day gutters.
6. **Badge pill** — small rounded pill for a platform badge or rank (e.g.
   "LeetCode · 100 Day Streak", "Codeforces · Expert").
7. **Button** — exactly two variants: primary (filled, accent color) and
   secondary (outline or ghost). No third button style.
8. **Nav bar** — logo/wordmark, minimal nav links, theme toggle, primary CTA.

Name every component in Figma to match likely React component names
(`Sidebar`, `HeatmapCell`, `BadgePill`, `Avatar`, `SearchInput`) so the
handoff to code is close to 1:1.

## Page 1 — Landing Page

Single scrolling page, in this order:
1. **Nav** — logo, "Log in", primary CTA button ("Continue with Google" or
   "Get Started")
2. **Hero** — one-line headline about aggregating dev activity into one
   profile, one-line subheading, one CTA button, and below it a real
   screenshot/mockup of an actual populated profile page (heatmap + badges
   visible) as the visual centerpiece — this image should do most of the
   persuasive work, not the copy
3. **Feature grid** — 3 to 6 short cards in a row (stack on mobile), each
   with a short title and one sentence, e.g. "One profile, every platform,"
   "Auto-synced heatmap," "Export as PDF," "Your own yourname.scard.app"
4. **Footer** — minimal: creator credit / GitHub link, nothing else

## Page 2 — Profile Page (two variants)

**Variant A — Directory mode** (used at `scard.app/explore`, own domain):
- Fixed-width left sidebar: search input with keyboard-shortcut hint,
  tab group for sorting (Activity / New / A–Z), scrollable list of sidebar
  list items (avatar, name, "joined X days ago")
- Main panel fills the remaining width: large avatar (with an ASCII-art
  toggle control), display name, user-set designation/title text, then a
  "Contributions" section showing the full heatmap grid (label the section
  in the small-caps metadata style), then a "Badges" section below it as a
  wrapped row of badge pill components

**Variant B — Standalone mode** (used at `username.scard.app`, no sidebar):
- Same main panel component as Variant A, centered in the viewport with
  generous margins, no sidebar present at all — this is the clean,
  screenshot-and-share version of the profile

Both variants must reuse the exact same main-panel components — do not
redesign the profile content between the two variants, only the presence or
absence of the sidebar changes.

## Responsive behavior

- **Desktop (≥1024px):** full layouts as described above
- **Tablet/mobile (<1024px):** sidebar (Variant A only) collapses fully
  behind a hamburger/menu icon in the bottom-right corner, opening as a
  slide-over drawer rather than a squeezed narrow column
- **Heatmap on small screens:** allow horizontal scroll within its own
  container rather than shrinking cells below a legible size; consider a
  shorter "recent activity" window as an alternative for very small viewports
- Design each page at three widths: desktop (1440px), tablet (768px), and
  mobile (390px)

## Keyboard shortcuts to reflect visually

Even though these are implemented in code later, design the UI to visibly
hint at them now:
- `⌘K` / `Ctrl+K` — opens a command palette / jump-to-profile search (show
  the hint pill inside the sidebar search input)
- `J` / `K` — move selection up/down the sidebar list
- `Enter` — open the selected profile
- `Esc` — close the search/command palette
- `G` then `P` — jump to the logged-in user's own profile

A small "Keyboard shortcuts" affordance (e.g. a `?` icon or hint text) in
a corner of the directory view is a nice, on-brand Swiss-minimalist touch —
optional but encouraged.

## What to explicitly avoid

- No gradients, no heavy shadows, no illustration/mascot artwork
- No more than one accent color
- No more than two button styles
- No decorative icons that don't map to a real action
- No additional pages beyond the two described above
- Do not replicate broken template-string text (e.g. `${item.start}`) seen
  in any reference screenshots — that was a rendering bug in the reference
  source, not a design element