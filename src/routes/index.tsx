import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Globe,
  Sparkles,
  Mail,
  BarChart3,
  Users,
  Workflow,
  MessageSquare,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Check,
  Minus,
  Plus,
  Quote,
  Zap,
  LayoutDashboard,
  X,
  Volume2,
  Menu,
} from "lucide-react";


// ---- Eager: above-the-fold (hero + nav + first paint) ----
import { KineticHeadline } from "@/components/landing/KineticHeadline";
import { InteractiveComposer } from "@/components/landing/InteractiveComposer";
import { LivePreview } from "@/components/landing/LivePreview";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Magnetic } from "@/components/landing/MagneticButton";
import { useWaitlist } from "@/components/landing/WaitlistDialog";
import { LaunchPulse } from "@/components/landing/LaunchPulse";
import { IndustryRotator } from "@/components/landing/IndustryRotator";
import { Reveal } from "@/components/landing/Reveal";
import logoUrl from "@/assets/crixy-logo.jpg";

// ---- Lazy: below-the-fold. Split from the initial JS bundle to
// improve LCP/TBT. Each is wrapped in <Suspense> with a height-reserving
// fallback so lazy hydration doesn't cause CLS.
const BeforeAfterSlider = lazy(() =>
  import("@/components/landing/BeforeAfterSlider").then((m) => ({ default: m.BeforeAfterSlider })),
);
const StackCollapse = lazy(() =>
  import("@/components/landing/StackCollapse").then((m) => ({ default: m.StackCollapse })),
);
const PricingCards = lazy(() =>
  import("@/components/landing/PricingCards").then((m) => ({ default: m.PricingCards })),
);
const FounderNote = lazy(() =>
  import("@/components/landing/FounderNote").then((m) => ({ default: m.FounderNote })),
);
const ChangelogFeed = lazy(() =>
  import("@/components/landing/ChangelogFeed").then((m) => ({ default: m.ChangelogFeed })),
);
const VoicePreview = lazy(() =>
  import("@/components/landing/VoicePreview").then((m) => ({ default: m.VoicePreview })),
);
const CostCalculator = lazy(() =>
  import("@/components/landing/CostCalculator").then((m) => ({ default: m.CostCalculator })),
);

/** Fixed-height skeleton so lazy sections don't trigger CLS while chunks load. */
function SectionSkeleton({ minHeight = 320 }: { minHeight?: number }) {
  return (
    <div
      aria-hidden
      style={{ minHeight }}
      className="mx-auto w-full max-w-7xl animate-pulse rounded-2xl bg-[var(--surface-1)]/40"
    />
  );
}


const HOME_TITLE = "Crixy AI - All-in-One AI Business Workspace for Growth";
const HOME_DESC =
  "Launch, market and grow with Crixy AI: websites, chatbots, CRM, outreach, content, analytics and automation in one business workspace.";
const HOME_URL = "https://usecrixy.com/";
const HOME_OG_IMAGE = "https://usecrixy.com/og-crixy.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESC },
      { name: "keywords", content: "Crixy AI, Crixy, usecrixy, AI workspace, AI tools, AI agents, business automation, AI CRM, AI chatbot, AI marketing" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESC },
      { property: "og:url", content: HOME_URL },
      { property: "og:image", content: HOME_OG_IMAGE },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESC },
      { name: "twitter:image", content: HOME_OG_IMAGE },
      { name: "twitter:image:alt", content: "Crixy AI — one AI workspace to launch, market and grow" },
      { property: "og:image:alt", content: "Crixy AI — one AI workspace to launch, market and grow" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:locale", content: "en_US" },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
    scripts: [
      // FAQPage schema — earns rich-result "People also ask" style expansion.
      // Each Question is tagged with an `about` DefinedTerm so search engines
      // can see the category grouping surfaced in the UI.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${HOME_URL}#faq`,
          url: `${HOME_URL}#faq`,
          inLanguage: "en",
          about: Array.from(new Set(FAQ.map((f) => f.category))).map((c) => ({
            "@type": "Thing",
            name: c,
          })),
          mainEntity: FAQ.map((f, i) => ({
            "@type": "Question",
            "@id": `${HOME_URL}#faq-q-${i + 1}`,
            name: f.q,
            about: {
              "@type": "DefinedTerm",
              name: f.category,
              inDefinedTermSet: `${HOME_URL}#faq-categories`,
            },
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
              inLanguage: "en",
            },
          })),
        }),
      },
      // SoftwareApplication schema — signals to Google that this is a
      // product/app page; enables the app-card treatment in search.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Crixy AI",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: HOME_URL,
          description: HOME_DESC,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/PreOrder",
            url: "https://usecrixy.com/pricing",
          },
          publisher: { "@type": "Organization", name: "Crixy AI", url: "https://usecrixy.com" },
        }),
      },
      // WebPage schema — describes this specific page for search engines.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${HOME_URL}#webpage`,
          url: HOME_URL,
          name: HOME_TITLE,
          description: HOME_DESC,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: "Crixy AI", url: "https://usecrixy.com" },
          primaryImageOfPage: { "@type": "ImageObject", url: HOME_OG_IMAGE },
          about: [
            { "@type": "Thing", name: "AI workspace" },
            { "@type": "Thing", name: "Business automation" },
            { "@type": "Thing", name: "AI agents" },
          ],
        }),
      },
    ],

  }),
  component: Index,
});

const FEATURES = [
  { icon: Globe, title: "Websites that convert", body: "Ship a production-ready site in under 10 minutes — copy, layout and imagery tuned for your offer, not a generic template." },
  { icon: Bot, title: "Support chatbot that closes tickets", body: "Deflect 60–80% of repeat questions with an on-brand chatbot trained on your docs, FAQs and past conversations." },
  { icon: Sparkles, title: "Content that stays on-brand", body: "Weeks of posts, captions and creatives drafted in your voice — cut content ops from days to minutes." },
  { icon: Calendar, title: "One calendar, every channel", body: "Plan, approve and publish across Instagram, LinkedIn, X and Facebook without leaving Crixy." },
  { icon: Mail, title: "Cold outreach that books meetings", body: "Personalised sequences that research the lead, write the email and follow up — measured in booked calls, not open rates." },
  { icon: BarChart3, title: "Revenue-focused analytics", body: "Site traffic, campaign spend and pipeline value on one screen — attributed to the channel that actually drove the sale." },
  { icon: Users, title: "CRM that suggests the next move", body: "Every lead captured, enriched and scored — with an AI that tells you who to follow up with today." },
  { icon: Workflow, title: "Automations without engineers", body: "Chain forms, emails, DMs and CRM updates into background workflows — no Zapier subscription, no glue code." },
];

const ROADMAP = [
  { tag: "Live", title: "The AI Business Workspace", body: "Website, chatbot, content, outreach, analytics and CRM in one." },
  { tag: "Next", title: "Voice AI agents", body: "Answer calls, qualify leads and book meetings 24/7." },
  { tag: "Next", title: "WhatsApp & Instagram automation", body: "Conversational AI across every message inbox." },
  { tag: "Later", title: "Sales & appointment engine", body: "Advanced pipelines, booking flows and revenue insights." },
  { tag: "Later", title: "Business & financial intelligence", body: "Real-time metrics, forecasts and anomaly detection." },
  { tag: "Later", title: "Team collaboration & 100+ integrations", body: "Roles, shared workspaces and a growing app marketplace." },
];

const LOGOS = ["NORTHWIND","HELIOS","OCTANE","MONOLITH","VERTEX","PARALLAX","AURORA","KILOMETRE","MERIDIAN","OBSIDIAN"];

const STEPS = [
  { n: "01", title: "Tell Crixy about your business", body: "Paste a URL, upload a deck, or answer 4 questions. In under two minutes Crixy knows your brand, offer and audience — no prompt engineering." },
  { n: "02", title: "Watch your workspace build itself", body: "A ready-to-review website, chatbot, 30-day content plan, CRM, outreach sequences and dashboard — generated together, wired to each other from day one." },
  { n: "03", title: "Publish, sell and grow — on autopilot", body: "Approve or edit, then ship. Crixy keeps replying, posting and following up in the background so you get back hours every week." },
];

// TODO(replace): swap for real customer quotes, avatars and company logos once beta users opt in.
const TESTIMONIALS: {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  companyLogo?: string;
}[] = [
  { quote: "Replaced Webflow, Intercom, Buffer and half our HubSpot workflows. Genuinely the first AI tool that actually saved us time.", name: "Amelia Kwan", role: "Founder", company: "Kilometre Studio" },
  { quote: "We launched a full site and cold outbound in one afternoon. Booked six calls in the first week from Crixy-written emails.", name: "Marcus Adeyemi", role: "GM", company: "Vertex Labs" },
  { quote: "The chatbot answers about 70% of what used to hit our inbox. It sounds like us, not like a generic AI.", name: "Priya Raman", role: "Ops Lead", company: "Northwind Coffee" },
];

type FaqItem = { q: string; a: string; category: string };
const FAQ: FaqItem[] = [
  // Product
  { category: "Product", q: "Is Crixy really replacing all these tools?", a: "For most small and mid-sized teams, yes — Crixy covers your website, chatbot, content, outreach, CRM, analytics and light automation. Larger orgs use us alongside a few specialised tools, and we integrate with them." },
  { category: "Product", q: "How is this different from ChatGPT or a website builder?", a: "Crixy isn't a single-purpose assistant or a template gallery. It's a workspace of AI agents that share context about your business and act across websites, messaging, marketing and sales together." },
  { category: "Product", q: "Do I need to know how to code?", a: "No. Everything is done through natural language and visual editors. You can bring a developer in later — Crixy exports clean assets and connects via API." },
  { category: "Product", q: "Which languages does Crixy support?", a: "English at launch, with Spanish, French, German, Portuguese, Hindi and Arabic in private preview. The chatbot detects the visitor's language automatically and replies in kind." },

  // Getting started
  { category: "Getting started", q: "How long does setup take?", a: "Most founders have a live website, chatbot and content plan within the first hour. Migrating an existing site, CRM and content library typically takes a single afternoon." },
  { category: "Getting started", q: "Can I migrate my existing website, CRM and content?", a: "Yes. Point Crixy at your existing site, export CSVs from your CRM and paste a Google Drive link for content — Crixy imports, cleans and organises it in one pass." },
  { category: "Getting started", q: "Do you offer onboarding help?", a: "Every founder-pricing account gets a 30-minute onboarding call with our team, plus async support on WhatsApp and email. Scale plans include a dedicated success manager." },

  // Integrations
  { category: "Integrations", q: "Do you integrate with the tools I already use?", a: "Yes — Stripe, HubSpot, Salesforce, Google Workspace, Slack, WhatsApp, Instagram, LinkedIn and Meta Ads at launch, with a growing app marketplace after that." },
  { category: "Integrations", q: "Can I connect my own domain and email?", a: "Yes. Bring your custom domain, connect your Google or Microsoft mailbox for outreach, and Crixy handles DNS, SPF and DKIM setup with guided instructions." },
  { category: "Integrations", q: "Is there an API?", a: "Yes — a REST API and webhooks are available on Growth and Scale plans, so you can pipe leads, events and content into any downstream system." },

  // Pricing & billing
  { category: "Pricing", q: "What does it cost after the beta?", a: "Founder-pricing beta users lock in a discounted rate for life. Public plans start free with paid tiers scaling by team size and usage — see the pricing page for the full breakdown." },
  { category: "Pricing", q: "Is there a free plan?", a: "Yes. The Starter plan is free forever and includes your website, a basic chatbot, 30 pieces of AI content per month and a lightweight CRM." },
  { category: "Pricing", q: "Do you offer discounts for non-profits or students?", a: "Yes — verified non-profits, students and early-stage founders get 50% off any paid plan. Reach out via our contact links with proof and we'll set you up." },

  // Security & data
  { category: "Security", q: "How does Crixy handle my data and privacy?", a: "Your data stays private, encrypted at rest (AES-256) and in transit (TLS 1.3). We never train shared models on your business data, and you can export or delete everything with one click." },
  { category: "Security", q: "Where is my data stored?", a: "Data is stored in ISO 27001 and SOC 2-audited data centres in the EU and US. You choose the region during workspace setup; we never move it without your written consent." },
  { category: "Security", q: "Are you GDPR compliant?", a: "Yes. We're a GDPR data processor, sign a Data Processing Agreement on request, and support the full set of data-subject rights — access, portability, rectification and erasure." },

  // Account
  { category: "Account", q: "Can I cancel or export my data anytime?", a: "Anytime, no contract, no penalty. Full JSON and CSV export of every workspace, contact and asset is one click away." },
  { category: "Account", q: "Do you offer refunds?", a: "Yes. Every paid plan comes with a 14-day no-questions-asked refund window. After that, downgrade or cancel at any time from your billing settings." },
];



function Index() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-solid)] text-[rgb(var(--ink))]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[rgb(var(--ink))] focus:px-4 focus:py-2 focus:text-sm focus:text-[rgb(var(--ink-inv))]"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Nav />
      <main id="main">
        <Hero />
        <LogoWall />
        <StatsStrip />
        {/* Everything below the fold is code-split. A single Suspense
            boundary lets React stream them in without blocking hero paint. */}
        <Suspense fallback={<SectionSkeleton minHeight={480} />}>
          <HowItWorks />
          <ProductPillars />
          <BentoShowcase />
          <VoiceSection />
          <CostCalculator />
          <ComparisonSection />
          <Roadmap />
          <FounderNote />
          <Testimonials />
          <ChangelogFeed />
          <PricingSection />
          <FaqSection />
          <FinalCTA />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}


/* ------------ Announcement (rotating + tz greeting + dismissible) ------------ */
const ANNOUNCEMENTS = [
  "Founder pricing locks in for life — join the private beta today",
  "New: voice AI agents that answer, qualify and book calls 24/7",
  "Ship a production-ready website in under 10 minutes with Crixy",
];


function AnnouncementBar() {
  const { open } = useWaitlist();
  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("crixy-announce-hidden") === "1") setHidden(true);
    const h = new Date().getHours();
    setGreeting(h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz.includes("/")) setCity(tz.split("/").pop()!.replace(/_/g, " "));
    } catch {}
    const t = setInterval(() => setIdx((v) => (v + 1) % ANNOUNCEMENTS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Reserve the bar's height at all times (SSR + after dismiss) so the
  // page below never jumps when hydration flips `hidden` or the user
  // dismisses it — eliminates announcement-bar CLS.
  return (
    <div
      className="border-b border-[var(--stroke-1)] bg-[var(--bg-solid)] text-[var(--text-muted)]"
      style={{ minHeight: 37 }}
    >
      {!hidden && (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 text-[12px]">
          <span className="hidden text-[var(--text-faint)] md:inline-flex md:items-center md:gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {greeting}{city ? `, ${city}` : ""}
          </span>
          <div className="flex flex-1 items-center justify-center gap-2 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={idx}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="truncate text-center"
              >
                {ANNOUNCEMENTS[idx]}
              </motion.span>
            </AnimatePresence>
            <button
              type="button"
              onClick={() => open("announcement")}
              className="ml-1 inline-flex shrink-0 items-center gap-1 text-[rgb(var(--ink))] hover:underline"
            >
              Get access <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setHidden(true);
              localStorage.setItem("crixy-announce-hidden", "1");
            }}
            aria-label="Dismiss announcement"
            className="grid h-5 w-5 place-items-center rounded-full text-[var(--text-faint)] hover:bg-[var(--surface-1)] hover:text-[rgb(var(--ink))]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}


/* ------------ Nav (with Product megamenu) ------------ */
const PRODUCT_ITEMS = [
  { icon: Globe, title: "Websites", desc: "Pro sites, generated in minutes.", href: "/#product" },
  { icon: Bot, title: "AI Chatbot", desc: "Trained on your business.", href: "/#product" },
  { icon: Sparkles, title: "Content", desc: "Posts and captions in your voice.", href: "/#product" },
  { icon: BarChart3, title: "Analytics", desc: "One dashboard, real numbers.", href: "/#product" },
  { icon: Users, title: "CRM", desc: "Every lead, enriched.", href: "/#product" },
  { icon: Workflow, title: "Automations", desc: "Chain your tools with AI.", href: "/#product" },
];

function Nav() {
  const { open } = useWaitlist();
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const productWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  // Close product megamenu on Escape or outside click
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(false);
    const onClick = (e: MouseEvent) => {
      if (!productWrapRef.current?.contains(e.target as Node)) setOpenMenu(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu]);

  type NavLink = { l: string; href: string; internal?: boolean };
  const navLinks: NavLink[] = [
    { l: "Product", href: "/#product" },
    { l: "How it works", href: "/#how-it-works" },
    { l: "Customers", href: "/customers", internal: true },
    { l: "Changelog", href: "/changelog", internal: true },
    { l: "Pricing", href: "/pricing", internal: true },
  ];

  const pillHover3D =
    "transition-transform duration-200 will-change-transform hover:[transform:translateZ(6px)_rotateX(6deg)]";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--stroke-1)] bg-[var(--bg-solid)]/70 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6"
        style={{ perspective: "1000px" }}
      >
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight">Crixy AI</span>
        </Link>
        <div
          ref={productWrapRef}
          className="relative hidden items-center gap-1 rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] px-2 py-1 text-[13px] text-[var(--text-muted)] shadow-[0_2px_8px_-4px_rgb(var(--ink)/0.1)] md:flex"
          style={{ transformStyle: "preserve-3d" }}
          onMouseLeave={() => setOpenMenu(false)}
        >
          <button
            type="button"
            onMouseEnter={() => setOpenMenu(true)}
            onFocus={() => setOpenMenu(true)}
            onClick={() => setOpenMenu((v) => !v)}
            aria-expanded={openMenu}
            aria-haspopup="menu"
            className={
              "inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-[var(--surface-2)] hover:text-[rgb(var(--ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)] " +
              pillHover3D
            }
          >
            Product
            <svg viewBox="0 0 20 20" className={"h-3 w-3 transition-transform duration-300 " + (openMenu ? "rotate-180" : "")} fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
            </svg>
          </button>
          {navLinks.slice(1).map(({ l, href, internal }) =>
            internal ? (
              <Link
                key={l}
                to={href}
                className={
                  "rounded-full px-3 py-1 hover:bg-[var(--surface-2)] hover:text-[rgb(var(--ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)] " +
                  pillHover3D
                }
              >
                {l}
              </Link>
            ) : (
              <a
                key={l}
                href={href}
                className={
                  "rounded-full px-3 py-1 hover:bg-[var(--surface-2)] hover:text-[rgb(var(--ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)] " +
                  pillHover3D
                }
              >
                {l}
              </a>
            ),
          )}

          <AnimatePresence>
            {openMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, rotateX: -18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, rotateX: -12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top center" }}
                className="absolute left-0 top-[calc(100%+10px)] z-50 w-[520px] overflow-hidden rounded-2xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-3 shadow-[0_30px_80px_-30px_rgb(0_0_0_/_0.55)]"
                role="menu"
              >
                <div className="grid grid-cols-2 gap-1">
                  {PRODUCT_ITEMS.map(({ icon: Icon, title, desc, href }) => (
                    <a
                      key={title}
                      href={href}
                      onClick={() => setOpenMenu(false)}
                      className="group flex items-start gap-3 rounded-xl p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-1)] hover:shadow-[0_10px_24px_-14px_rgb(var(--ink)/0.35)]"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--stroke-1)] bg-[var(--surface-1)] text-[rgb(var(--ink))] transition-transform duration-300 group-hover:bg-[var(--bg-solid)] group-hover:[transform:rotateY(180deg)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-display text-[13px] font-semibold text-[rgb(var(--ink))]">{title}</span>
                        <span className="block text-[12px] text-[var(--text-muted)]">{desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-[var(--surface-1)] px-3 py-2 text-[12px] text-[var(--text-muted)]">
                  <span>All of it, in one intelligent workspace.</span>
                  <a href="/#product" onClick={() => setOpenMenu(false)} className="inline-flex items-center gap-1 font-medium text-[rgb(var(--ink))] hover:underline">
                    Explore <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <span className="hidden md:inline-flex">
            <Magnetic
              as="button"
              onClick={() => open("nav")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--ink))] px-4 py-2 text-sm font-medium text-[rgb(var(--ink-inv))] shadow-[0_10px_24px_-12px_rgb(var(--ink)/0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)]"
            >
              Get founder access <ArrowUpRight className="h-3.5 w-3.5" />
            </Magnetic>
          </span>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] text-[rgb(var(--ink))] transition-transform duration-200 hover:bg-[var(--surface-2)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)] md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
            style={{ perspective: "1200px" }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: -16, opacity: 0, rotateX: -22, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
              exit={{ y: -12, opacity: 0, rotateX: -14, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
              className="relative mx-3 mt-3 max-h-[calc(100dvh-1.5rem)] overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0_/_0.7)]"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-display text-sm font-semibold tracking-tight">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-1)] hover:text-[rgb(var(--ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <ul className="flex flex-col p-1">
                {navLinks.map(({ l, href, internal }, i) => (
                  <motion.li
                    key={l}
                    initial={{ opacity: 0, y: -6, rotateX: -14 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.04 * i + 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "top center" }}
                  >
                    {internal ? (
                      <Link
                        to={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center justify-between rounded-xl px-3 py-3 text-[15px] text-[rgb(var(--ink))] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-1)]"
                      >
                        {l}
                        <ArrowRight className="h-4 w-4 text-[var(--text-faint)]" aria-hidden />
                      </Link>
                    ) : (
                      <a
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center justify-between rounded-xl px-3 py-3 text-[15px] text-[rgb(var(--ink))] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-1)]"
                      >
                        {l}
                        <ArrowRight className="h-4 w-4 text-[var(--text-faint)]" aria-hidden />
                      </a>
                    )}
                  </motion.li>
                ))}
              </ul>
              <div className="p-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    open("mobile-nav");
                  }}
                  className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[rgb(var(--ink))] px-4 py-3 text-sm font-medium text-[rgb(var(--ink-inv))] shadow-[0_16px_30px_-14px_rgb(var(--ink)/0.6)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.3)]"
                >
                  Get founder access <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}



function Logo() {
  return (
    <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-md border border-[var(--stroke-2)] bg-black">
      <img src={logoUrl} alt="Crixy AI" width={20} height={20} className="h-5 w-5 object-contain" draggable={false} fetchPriority="high" decoding="async" />
    </div>
  );
}

/* ------------ Hero ------------ */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Subtle background: soft grid + gentle radial vignette. */}
      <div className="pointer-events-none absolute inset-0 crixy-grid opacity-[0.35]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgb(var(--ink) / 0.06), transparent 70%)",
        }}
      />
      {/* Signature: concentric "listening" rings pulsing behind the headline. */}
      <div className="pointer-events-none absolute left-1/2 top-[120px] -translate-x-1/2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-[rgb(var(--ink)/0.12)]"
            style={{ width: 220, height: 220, marginLeft: -110, marginTop: -110 }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.9], opacity: [0.55, 0] }}
            transition={{
              duration: 4.5,
              ease: "easeOut",
              repeat: Infinity,
              delay: i * 1.5,
            }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        aria-hidden
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg-solid))" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex flex-col items-center gap-2.5">
            <LaunchPulse />
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[var(--text-faint)] sm:tracking-[0.24em]">
              Built for <IndustryRotator />
            </div>
          </div>
          <KineticHeadline />
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--text-muted)] sm:mt-6 sm:text-[17px]">
            Website, chatbot, content, outreach, CRM and analytics — one AI
            workspace that replaces the eleven tools you're duct-taping
            together today.
          </p>

          {/* Editorial pull-quote in Fraunces to break the sans-serif rhythm */}
          <p className="mx-auto mt-6 max-w-lg font-serif-italic text-[17px] leading-snug text-[rgb(var(--ink)/0.55)] sm:text-[19px]">
            "The workspace that runs your business while you sleep."
          </p>

        </div>

        {/* Interactive composer */}
        <div id="waitlist" className="mx-auto mt-8 max-w-2xl sm:mt-10">
          <InteractiveComposer />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-[var(--text-faint)]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> SOC-ready infra
            </span>
            <span>No credit card required</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" aria-hidden /> Ships in minutes
            </span>
          </div>
        </div>

        {/* Live preview */}
        <div className="relative mt-14 sm:mt-20">
          <LivePreview />
        </div>
      </div>
    </section>
  );
}

/* ------------ Logo wall ------------ */
function LogoWall() {
  return (
    <section className="relative border-y border-[var(--stroke-1)] bg-[var(--surface-1)] py-8">
      <div className="mb-5 flex flex-col items-center gap-3">
        <span
          className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke-1)] bg-[var(--bg-solid)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]"
          aria-label="Private beta waitlist status"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Private beta · 1,200+ founding teams on the waitlist
        </span>
        <p className="text-center text-[11px] uppercase tracking-[0.28em] text-[var(--text-faint)]">
          Teams building with Crixy · logos illustrative during private beta
        </p>
      </div>
      <div className="mask-fade-x overflow-hidden">
        <div className="marquee-track flex w-max gap-16 whitespace-nowrap px-8 font-display text-[15px] tracking-[0.28em] text-[var(--text-muted)]">
          {[...LOGOS, ...LOGOS].map((l, i) => (
            <span key={i} className="opacity-80">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ How it works ------------ */
function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
            From a single sentence to a <span className="font-serif-italic text-[rgb(var(--ink)/0.75)]">running business</span> in minutes.
          </h2>
        </div>
        <p className="max-w-md text-sm text-[var(--text-muted)]">
          No integrations to wire up. No prompt engineering. Describe what you want and Crixy
          composes an entire workspace around it.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.n} className="relative overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-gradient-to-b from-[var(--surface-1)] to-transparent p-6">
            <div className="mb-8 flex items-baseline justify-between">
              <span className="font-mono text-xs tracking-widest text-[var(--text-faint)]">STEP {s.n}</span>
              <span className="font-serif-italic text-4xl text-[rgb(var(--ink)/0.15)]">{i + 1}</span>
            </div>
            <h3 className="font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------ Product pillars ------------ */
function ProductPillars() {
  return (
    <section id="product" className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
      <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <SectionEyebrow>The workspace</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
            Everything a modern business needs, <br className="hidden sm:block" />
            <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">in one intelligent surface.</span>
          </h2>
        </div>
        <p className="max-w-md text-sm text-[var(--text-muted)]">
          Stop stitching together websites, schedulers, CRMs and analytics.
          Crixy unifies them — and puts an AI agent behind each one.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-[var(--stroke-1)] sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group relative flex flex-col justify-between bg-[var(--bg-solid)] p-6 transition hover:bg-[var(--surface-1)]">
            <div>
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--stroke-1)] bg-[var(--surface-1)]">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
            </div>
            <ArrowUpRight className="mt-8 h-4 w-4 text-[var(--text-faint)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[rgb(var(--ink))]" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------ Bento showcase ------------ */
function BentoShowcase() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal className="mb-14 max-w-2xl">
        <SectionEyebrow>Under the hood</SectionEyebrow>
        <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
          Interfaces designed to <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">feel like calm.</span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-gradient-to-br from-[var(--surface-1)] to-transparent p-8">
          <div className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
            <MessageSquare className="h-3.5 w-3.5" /> AI chatbot trained on your business
          </div>
          <ChatMock />
          <p className="mt-8 max-w-lg text-sm text-[var(--text-muted)]">
            Point Crixy at your website and documents. In minutes you get a chatbot
            that answers, qualifies and hands off — everywhere your customers already are.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-8">
          <div>
            <div className="mb-6 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Unified analytics</div>
            <h3 className="font-display text-2xl font-semibold leading-snug">
              Website, social and campaigns — one number that matters.
            </h3>
          </div>
          <AnalyticsMock />
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-8">
          <div>
            <div className="mb-6 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Content engine</div>
            <h3 className="font-display text-2xl font-semibold leading-snug">
              30 days of on-brand posts, scheduled and shipped.
            </h3>
          </div>
          <ContentPlanMock />
        </div>

        <div className="lg:col-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-gradient-to-tl from-[var(--surface-1)] to-transparent p-8">
          <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
            <LayoutDashboard className="h-3.5 w-3.5" /> CRM with an AI copilot
          </div>
          <CrmMock />
          <p className="mt-6 max-w-lg text-sm text-[var(--text-muted)]">
            Every lead is enriched, scored and routed. Crixy suggests the next best move
            — a reply, a call, a nurture sequence — and can execute it for you.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------ Comparison ------------ */
function ComparisonSection() {
  const rows = [
    ["Website builder", "Webflow, Framer"],
    ["Trained chatbot", "Intercom Fin, Ada"],
    ["Content generation", "Jasper, Copy.ai"],
    ["Social scheduling", "Buffer, Later"],
    ["Cold outreach", "Instantly, Smartlead"],
    ["Analytics", "GA4, Fathom"],
    ["CRM", "HubSpot Starter"],
    ["Workflow automation", "Zapier, Make"],
  ] as const;
  return (
    <section className="relative border-y border-[var(--stroke-1)] bg-[var(--surface-1)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 max-w-2xl">
          <SectionEyebrow>Stack replaced</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
            One subscription. <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">Eight tools quieter.</span>
          </h2>
        </div>

        <div className="mb-14 rounded-3xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-10">
          <StackCollapse />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-[var(--bg-solid)]">
            <div className="grid grid-cols-[1.4fr_0.6fr_1fr] items-center gap-4 border-b border-[var(--stroke-1)] bg-[var(--surface-1)] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              <span>Capability</span><span>Crixy</span><span>You can drop</span>
            </div>
            {rows.map(([label, alt]) => (
              <div key={label} className="grid grid-cols-[1.4fr_0.6fr_1fr] items-center gap-4 border-b border-[var(--stroke-1)] px-6 py-4 text-sm last:border-0">
                <span className="text-[rgb(var(--ink))]">{label}</span>
                <span>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </span>
                <span className="text-[var(--text-muted)]">{alt}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-4 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">Before / After</div>
            <BeforeAfterSlider />
            <p className="mt-3 text-xs text-[var(--text-faint)]">Drag the handle to see the difference.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------ Roadmap ------------ */
function Roadmap() {
  return (
    <section id="roadmap" className="relative border-y border-[var(--stroke-1)] bg-[var(--surface-1)]/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow>Roadmap</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
            From workspace to a full <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">AI operating system.</span>
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            We're building toward voice agents, messaging automation, appointment booking,
            sales intelligence and hundreds of integrations — making AI accessible from startup
            to enterprise.
          </p>
        </div>

        <ol className="relative grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-[var(--stroke-1)] md:grid-cols-3">
          {ROADMAP.map((r) => (
            <li key={r.title} className="bg-[var(--bg-solid)] p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <span className={"h-1.5 w-1.5 rounded-full " + (r.tag === "Live" ? "bg-[rgb(var(--ink))]" : "bg-[var(--text-faint)]")} />
                {r.tag}
              </div>
              <h3 className="font-display text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{r.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------ Testimonials ------------ */
function Testimonials() {
  return (
    <section className="relative border-y border-[var(--stroke-1)] bg-[var(--surface-1)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="mb-14 max-w-2xl">
          <SectionEyebrow>Loved by operators</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
            The teams that ship the most <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">already use it.</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex h-full flex-col justify-between rounded-3xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-6">
              <Quote className="h-5 w-5 text-[var(--text-faint)]" />
              <blockquote className="mt-4 font-display text-[17px] leading-snug text-[rgb(var(--ink))]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--stroke-1)] pt-4">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 place-items-center rounded-full bg-[rgb(var(--ink))] font-semibold text-[rgb(var(--ink-inv))]"
                  >
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                )}
                <div className="flex flex-1 items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="text-[rgb(var(--ink))]">{t.name}</div>
                    <div className="text-[var(--text-faint)]">{t.role} · {t.company}</div>
                  </div>
                  {t.companyLogo ? (
                    <img
                      src={t.companyLogo}
                      alt={`${t.company} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-5 w-auto opacity-70"
                    />
                  ) : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Pricing ------------ */
function PricingSection() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-12 text-center">
        <SectionEyebrow center>Founder pricing</SectionEyebrow>
        <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
          Start free. <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">Grow when you're ready.</span>
        </h2>
      </div>
      <PricingCards />
    </section>
  );
}

/* ------------ FAQ ------------ */
function FaqSection() {
  const { open: openWaitlist } = useWaitlist();
  const [open, setOpen] = useState<string | null>(FAQ[0]?.q ?? null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(FAQ.map((f) => f.category)))];
  const visible = activeCategory === "All" ? FAQ : FAQ.filter((f) => f.category === activeCategory);

  return (
    <section id="faq" className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-8 text-center">
        <SectionEyebrow center>FAQ</SectionEyebrow>
        <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
          Answers, <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">not marketing.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--text-muted)]">
          Everything founders ask before they sign up. Can't find yours?{" "}
          <button
            type="button"
            onClick={() => openWaitlist("faq-contact")}
            className="underline hover:text-[rgb(var(--ink))]"
          >
            Contact us
          </button>.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="FAQ categories"
        className="mb-6 flex flex-wrap items-center justify-center gap-2"
      >
        {categories.map((c) => {
          const active = activeCategory === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(c)}
              className={
                "min-h-9 rounded-full border px-3.5 py-1.5 text-[12px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.4)] " +
                (active
                  ? "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]"
                  : "border-[var(--stroke-1)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:border-[var(--stroke-2)] hover:text-[rgb(var(--ink))]")
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-[var(--stroke-1)] rounded-3xl border border-[var(--stroke-1)] bg-[var(--surface-1)]">
        {visible.map((f, i) => {
          const isOpen = open === f.q;
          const key = `${f.category}-${i}`;
          const panelId = `faq-panel-${key}`;
          const buttonId = `faq-button-${key}`;
          return (
            <div key={f.q}>
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : f.q)}
                  className="flex w-full items-center justify-between gap-6 rounded-none px-5 py-5 text-left transition-colors hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--ink)/0.4)] sm:px-6"
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">{f.category}</span>
                    <span className="font-display text-[15px] font-semibold sm:text-lg">{f.q}</span>
                  </span>
                  <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--stroke-1)] transition-transform duration-300" style={{ transform: isOpen ? "rotate(180deg)" : undefined }}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="px-5 pb-6 text-[14px] leading-relaxed text-[var(--text-muted)] sm:px-6 sm:text-sm"
              >
                {f.a}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[var(--text-faint)]">
        Showing {visible.length} of {FAQ.length} questions
        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
      </p>
    </section>
  );
}

/* ------------ Final CTA ------------ */
function FinalCTA() {
  const { open } = useWaitlist();
  return (
    <section className="relative overflow-hidden border-t border-[var(--stroke-1)]">
      <div className="absolute inset-0 crixy-dots opacity-60" aria-hidden />
      <div className="aurora" style={{ top: -100, left: "40%", width: 480, height: 480, background: "radial-gradient(circle, rgb(var(--ink)/0.15), transparent 60%)" }} />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 text-center">
        <SectionEyebrow center>Ready when you are</SectionEyebrow>
        <h2 className="font-display text-[clamp(2rem,8vw,2.5rem)] font-semibold leading-[1.06] tracking-tight sm:text-6xl sm:leading-[1.02]">
          Run your business on <span className="font-serif-italic text-[rgb(var(--ink)/0.8)]">one AI.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--text-muted)]">
          Lock in founder pricing for life and be first when Crixy AI opens to your industry.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic
            as="button"
            onClick={() => open("final-cta")}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[rgb(var(--ink))] px-6 py-3.5 text-sm font-medium text-[rgb(var(--ink-inv))] transition hover:opacity-90 sheen"
          >
            Get founder access — free <ArrowUpRight className="h-4 w-4" />
          </Magnetic>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--stroke-2)] bg-[var(--surface-1)] px-6 py-3.5 text-sm font-medium text-[rgb(var(--ink))] transition hover:bg-[var(--surface-2)]"
          >
            See how it works
          </a>
        </div>
        <div className="mt-4 text-[12px] text-[var(--text-faint)]">Free during beta · No credit card · Cancel anytime</div>

      </div>
    </section>
  );
}

/* ------------ Voice AI preview ------------ */
function VoiceSection() {
  return (
    <section className="relative border-y border-[var(--stroke-1)] bg-[var(--surface-1)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-24 lg:py-28 md:grid-cols-2">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--text-faint)]">
            <Volume2 className="h-3.5 w-3.5" /> Coming soon · voice AI
          </div>
          <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05]">
            A voice that <span className="font-serif-italic text-[rgb(var(--ink)/0.75)]">sounds like you</span>, answering every call.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--text-muted)]">
            Crixy voice agents pick up in one ring, qualify the lead, answer the
            usual questions and book the meeting — 24/7, in your brand voice. No
            script trees. No hold music.
          </p>
          <ul className="mt-6 space-y-2 text-[14px] text-[var(--text-muted)]">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[rgb(var(--ink))]" /> Handles inbound &amp; outbound calls</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[rgb(var(--ink))]" /> Books meetings straight into your calendar</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[rgb(var(--ink))]" /> Speaks 30+ languages, cloned to your brand</li>
          </ul>
        </div>
        <VoicePreview />
      </div>
    </section>
  );
}

/* ------------ Footer ------------ */
function Footer() {
  return (
    <footer className="border-t border-[var(--stroke-1)] bg-[var(--bg-solid)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-6">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg font-semibold tracking-tight">Crixy AI</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-[var(--text-muted)]">
            The all-in-one AI business workspace. Launch, market and grow — from one place.
          </p>
          <p className="mt-6 font-serif-italic text-lg text-[var(--text-faint)] sm:text-xl">
            Software that runs a business, so you can build one.
          </p>
          <div className="mt-5 space-y-1 text-sm text-[var(--text-muted)]">
            <p>Remote-first from India, serving teams worldwide.</p>
            <p>
              Phone{" "}
              <a href="tel:+918962890425" className="hover:text-[rgb(var(--ink))]">
                +91 89628 90425
              </a>
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] px-3 py-1 text-[11px] text-[var(--text-muted)]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </div>
        </div>
        <FooterCol title="Product" items={[
          { l: "Websites", href: "#product" },
          { l: "Chatbot", href: "#product" },
          { l: "Content", href: "#product" },
          { l: "CRM", href: "#product" },
          { l: "Analytics", href: "#product" },
          { l: "Automations", href: "#product" },
        ]} />
        <FooterCol title="Company" items={[
          { l: "Customers", href: "/customers" },
          { l: "Blog", href: "/blog" },
          { l: "Changelog", href: "/changelog" },
          { l: "Pricing", href: "/pricing" },
          { l: "Roadmap", href: "#roadmap" },
          { l: "FAQ", href: "#faq" },
        ]} />
        <FooterCol
          className="col-span-2 md:col-span-1"
          title="Contact"
          items={[
            { l: "WhatsApp us", href: "https://wa.me/918962890425?text=Hi%20Saksham%2C%20I%27d%20like%20to%20chat%20about%20Crixy%20AI" },
            { l: "X", href: "https://x.com/crixyai" },
            { l: "Facebook", href: "https://www.facebook.com/crixyai" },
            { l: "Instagram", href: "https://www.instagram.com/crixy.ai" },
            { l: "YouTube", href: "https://www.youtube.com/@crixyai" },
            { l: "LinkedIn page", href: "https://www.linkedin.com/company/crixy-ai" },
            { l: "LinkedIn", href: "https://www.linkedin.com/in/saksham-singh-ba591638a" },
          ]}
        />
        <FooterCol title="Legal" items={[
          { l: "Privacy", href: "/privacy" },
          { l: "Terms", href: "#" },
          { l: "Security", href: "#" },
          { l: "DPA", href: "#" },
        ]} />
      </div>
      <div className="border-t border-[var(--stroke-1)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-[var(--text-faint)] sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} Crixy AI. All rights reserved.</span>
          <span>Built for teams that want to move faster.</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------ Small helpers ------------ */
function SectionEyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={"mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-faint)] " + (center ? "justify-center" : "")}>
      <span className="h-px w-6 bg-[var(--stroke-2)]" />
      {children}
    </div>
  );
}

function FooterCol({ title, items, className = "" }: { title: string; items: { l: string; href: string }[]; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">{title}</div>
      <ul className="space-y-2 text-sm text-[var(--text-muted)]">
        {items.map((i) => (
          <li key={i.l}>
            {i.href.startsWith("/") ? (
              <Link to={i.href} className="hover:text-[rgb(var(--ink))]">{i.l}</Link>
            ) : (
              <a
                href={i.href}
                {...(i.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="hover:text-[rgb(var(--ink))] break-all"
              >
                {i.l}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-4 shadow-2xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-[rgb(var(--ink))] text-[10px] font-bold text-[rgb(var(--ink-inv))]">C</div>
        <span className="text-xs text-[var(--text-muted)]">Crixy assistant</span>
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[rgb(var(--ink))]" />
      </div>
      <div className="space-y-2 text-sm">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[var(--stroke-1)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-muted)]">
          Hi! Looking to book an appointment?
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[rgb(var(--ink))] px-3 py-2 text-[rgb(var(--ink-inv))]">
          Yes — Friday morning if possible.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[var(--stroke-1)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-muted)]">
          Friday 10:30am with Dr. Patel works. Should I confirm and add it to your calendar?
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--stroke-1)] bg-[var(--surface-1)] px-3 py-2 text-xs text-[var(--text-faint)]">
        Type a message… <span className="caret ml-auto inline-block h-3 w-[6px]" />
      </div>
    </div>
  );
}

function AnalyticsMock() {
  const bars = [22, 40, 34, 55, 48, 72, 66, 90, 78, 96];
  return (
    <div className="mt-8 rounded-2xl border border-[var(--stroke-1)] bg-[var(--surface-1)] p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs text-[var(--text-faint)]">Pipeline this month</div>
          <div className="font-display text-2xl font-semibold">+184%</div>
        </div>
        <div className="text-xs text-[var(--text-faint)]">vs last</div>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5" role="img" aria-label="Pipeline growth trending up over 10 weeks">
        {bars.map((b, i) => (
          <div key={i} aria-hidden className="flex-1 rounded-sm bg-gradient-to-t from-[rgb(var(--ink)/0.2)] to-[rgb(var(--ink))]" style={{ height: `${b}%` }} />
        ))}
      </div>
    </div>
  );
}

function ContentPlanMock() {
  const posts = [
    { d: "Mon", t: "Launch teaser" },
    { d: "Tue", t: "Founder POV" },
    { d: "Wed", t: "Customer story" },
    { d: "Thu", t: "Product demo" },
    { d: "Fri", t: "Weekend offer" },
  ];
  return (
    <div className="mt-8 space-y-2">
      {posts.map((p) => (
        <div key={p.d} className="flex items-center justify-between rounded-lg border border-[var(--stroke-1)] bg-[var(--surface-1)] px-3 py-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-8 font-mono text-[11px] uppercase tracking-widest text-[var(--text-faint)]">{p.d}</span>
            <span className="text-[rgb(var(--ink))]">{p.t}</span>
          </div>
          <span className="rounded-full border border-[var(--stroke-1)] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Scheduled</span>
        </div>
      ))}
    </div>
  );
}

function CrmMock() {
  const leads = [
    { n: "Amelia Kwan", c: "Kilometre Studio", s: 92, tag: "Hot" },
    { n: "Marcus Adeyemi", c: "Vertex Labs", s: 74, tag: "Warm" },
    { n: "Priya Raman", c: "Northwind", s: 61, tag: "Warm" },
    { n: "Jules Okafor", c: "Obsidian Co.", s: 38, tag: "Nurture" },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--stroke-1)]">
      <div className="grid grid-cols-[1.4fr_1fr_0.6fr_0.6fr] items-center gap-3 border-b border-[var(--stroke-1)] bg-[var(--surface-1)] px-4 py-2 text-[11px] uppercase tracking-widest text-[var(--text-faint)]">
        <span>Lead</span><span>Company</span><span>Score</span><span>Stage</span>
      </div>
      {leads.map((l) => (
        <div key={l.n} className="grid grid-cols-[1.4fr_1fr_0.6fr_0.6fr] items-center gap-3 border-b border-[var(--stroke-1)] px-4 py-3 text-sm last:border-0">
          <span className="text-[rgb(var(--ink))]">{l.n}</span>
          <span className="text-[var(--text-muted)]">{l.c}</span>
          <span className="font-mono text-[rgb(var(--ink))]">{l.s}</span>
          <span className={
            "inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest " +
            (l.tag === "Hot"
              ? "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]"
              : l.tag === "Warm"
              ? "border-[var(--stroke-2)] text-[rgb(var(--ink))]"
              : "border-[var(--stroke-1)] text-[var(--text-faint)]")
          }>
            {l.tag}
          </span>
        </div>
      ))}
    </div>
  );
}
