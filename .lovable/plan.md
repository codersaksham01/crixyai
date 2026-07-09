## Scope

Polish the existing Crixy AI landing without changing branding, color, layout, or the premium black-and-white identity. Fix copy, trust, dashboards, animations, spacing and a11y — nothing gets redesigned. Because this touches ~15 files across ~1,200-line route, we'll ship it in 4 sequential passes so you can review each without a giant diff.

## What already exists (skip re-building)

- Hero, Nav, AnnouncementBar, LogoWall, StatsStrip
- HowItWorks (3 steps), ProductPillars, BentoShowcase, VoiceSection, CostCalculator
- ComparisonSection, Roadmap, FounderNote, Testimonials (3), ChangelogFeed
- PricingSection (PricingCards), FaqSection (4 Qs), FinalCTA, Footer
- IndustryRotator, BeforeAfterSlider, LivePreview

Deliverable = polish these, not add duplicates.

---

## Pass 1 — Copy & CTA (item 1, 2, 4, 13)

Rewrite for clarity + conversion; identical visual density.

- **Hero:** tighten headline + subhead so the value is obvious in one glance. Primary CTA "Join the waitlist" → **"Get founder access — free"**. Secondary CTA "See how it works" (scrolls to #how-it-works).
- **Announcement bar:** replace generic rotators with one live CTA + one social-proof line.
- **FEATURES[8]:** rewrite each `body` in outcome terms ("Answer 70% of support tickets automatically" vs "Trained AI chatbot").
- **STEPS[3]:** rewrite so each ends in a measurable outcome.
- **FAQ:** expand from 4 → 8 with real objections (pricing, data, migration, cancel, integrations, security, team seats, export).
- **FinalCTA:** stronger closer, single primary action.
- Sweep and remove any lorem/placeholder text.

## Pass 2 — Trust & social proof (item 6, 8)

- **LogoWall:** keep current dummy logo strip but add a small "Trusted by teams building with Crixy — logos illustrative during private beta" microcopy so it doesn't read as a fake claim.
- **Testimonials:** structure the array so real quotes can drop in later; add `avatar` + `companyLogo` fields (fallback: initials). Add a "Verified beta user" chip slot.
- **Waitlist stat card:** small pill under hero showing `N founders on the waitlist` (already have the RPC-free Formspree flow — this stays a static/config-driven number for now with a comment on how to wire it live later).
- **IndustryRotator:** confirm 5 industries you want visible (Export, Real Estate, Healthcare, Agencies, Ecommerce) and put those front-and-center as pinned tabs.

## Pass 3 — Dashboards & realism (item 3, 5)

- Audit `LivePreview`, `BentoShowcase`, `InteractiveComposer` for any "Lorem"/"Sample"/"Untitled" strings and swap for realistic beta content (real-looking campaign names, funnel numbers, chat transcripts).
- Add subtle scroll-linked reveals to sections that currently have none: 12-16px rise + 400ms ease-out via existing `framer-motion` — never bouncy, never staggered longer than 250ms.
- Ensure `prefers-reduced-motion` disables them (framer-motion `useReducedMotion`).

## Pass 4 — Pricing, footer, spacing, perf, a11y (item 9, 11, 12, 14, 15)

- **PricingCards:** add "Most popular" ribbon to the middle tier, unify feature-row heights, add a one-line outcome under each price.
- **Footer:** expand columns — Product / Company / Resources / Legal — with the routes that already exist (/pricing, /blog, /customers, /changelog, /privacy) plus contact email + LinkedIn/X icons.
- **Spacing sweep:** normalize section vertical padding to `py-20 md:py-28`, radii to `rounded-2xl` on cards, `rounded-3xl` on hero panels.
- **Perf:** convert the largest below-fold JPGs to `?format=avif&format=webp;jpg` via `vite-imagetools` (already installed), add `fetchpriority="high"` to the hero image only, add `loading="lazy" decoding="async"` everywhere else. Verify LCP element preload link in root head.
- **A11y:** icon-only Buttons get `aria-label`, contrast tokens replace any raw greys, single `<main>`, focus-visible rings audited, tap targets ≥ 44×44 on mobile.

---

## Technical notes

- Route file (`src/routes/index.tsx`) stays intact — only inline strings + a few JSX tweaks per pass.
- No new backend, no new deps (vite-imagetools + framer-motion + lucide are already in).
- Each pass = one atomic set of edits + a quick build check; nothing merged in parallel.

## Things I need from you before Pass 1

1. **Hero headline** — I'll draft 3 tight options; is that OK or do you want to write it yourself?
2. **Real testimonials / logos** — do any exist yet? If not, I'll leave clearly-marked placeholders with `TODO(replace)` comments so they're easy to find later.
3. **Founder contact email** for the footer (support@usecrixy.com?).
4. **Confirm the 5 pinned industries** (Export, Real Estate, Healthcare, Agencies, Ecommerce)?

Reply with answers (or "you decide" per item) and I'll ship Pass 1 immediately, then Pass 2, 3, 4 in order.
