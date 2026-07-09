import { createFileRoute, Link } from "@tanstack/react-router";

const BLOG_URL = "https://usecrixy.com/blog";
const BLOG_TITLE = "Blog — AI Marketing, Growth & Automation for Founders | Crixy";
const BLOG_DESC =
  "Playbooks, case studies and field notes on using AI to launch, market and grow your business — from the Crixy team.";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: BLOG_TITLE },
      { name: "description", content: BLOG_DESC },
      { property: "og:title", content: BLOG_TITLE },
      { property: "og:description", content: BLOG_DESC },
      { property: "og:url", content: BLOG_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: BLOG_TITLE },
      { name: "twitter:description", content: BLOG_DESC },
    ],
    links: [{ rel: "canonical", href: BLOG_URL }],
    scripts: [
      // Blog schema — helps Google understand this is a content hub
      // and eligible for the "Top stories" carousel.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Crixy AI Blog",
          url: BLOG_URL,
          publisher: { "@type": "Organization", name: "Crixy AI", url: "https://usecrixy.com" },
        }),
      },
    ],
  }),
  component: BlogPage,
});


const POSTS = [
  { slug: "one-workspace", date: "Jul 02, 2026", title: "The case against fifteen SaaS logins", read: "6 min read" },
  { slug: "chatbots-that-sound-human", date: "Jun 18, 2026", title: "Chatbots that sound like your team, not like an AI", read: "8 min read" },
  { slug: "cold-outreach-2026", date: "Jun 05, 2026", title: "Cold outreach in 2026 — what still works", read: "5 min read" },
  { slug: "ai-content-not-slop", date: "May 22, 2026", title: "How to make AI content that isn't slop", read: "9 min read" },
];

function BlogPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-solid)] text-[rgb(var(--ink))]">
      <SubPageNav />
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[var(--text-faint)]">Blog</div>
        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Notes from the <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">workshop</span>.
        </h1>
        <p className="mt-4 max-w-xl text-[var(--text-muted)]">
          Essays, playbooks and the occasional strong opinion on AI, small business and building calmer software.
        </p>

        <ul className="mt-16 divide-y divide-[var(--stroke-1)] border-y border-[var(--stroke-1)]">
          {POSTS.map((p) => (
            <li key={p.slug} className="group flex items-baseline justify-between gap-6 py-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  {p.date} · {p.read}
                </div>
                <div className="mt-1 font-display text-2xl font-semibold group-hover:italic">{p.title}</div>
              </div>
              <span className="rounded-full border border-[var(--stroke-1)] px-3 py-1 text-xs text-[var(--text-muted)]">Read</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SubPageNav() {
  return (
    <div className="border-b border-[var(--stroke-1)] bg-[var(--bg-solid)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--stroke-2)] bg-[rgb(var(--ink))] font-display font-bold text-[rgb(var(--ink-inv))]">C</div>
          <span className="font-display text-lg font-semibold">Crixy AI</span>
        </Link>
        <Link to="/" className="text-sm text-[var(--text-muted)] hover:text-[rgb(var(--ink))]">← Back home</Link>
      </div>
    </div>
  );
}
