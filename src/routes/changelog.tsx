import { createFileRoute, Link } from "@tanstack/react-router";
import { ChangelogFeed } from "@/components/landing/ChangelogFeed";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — What's New in Crixy AI | AI Workspace Updates" },
      { name: "description", content: "Follow the latest features, integrations, improvements and fixes shipped to Crixy AI as we build the all-in-one AI business workspace." },
      { name: "keywords", content: "Crixy AI changelog, Crixy updates, usecrixy release notes, AI workspace updates, AI tools changelog" },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Changelog — What's New in Crixy AI" },
      { property: "og:description", content: "Follow the latest features, integrations, improvements and fixes shipped to Crixy AI as we build the all-in-one AI business workspace." },
      { property: "og:url", content: "https://usecrixy.com/changelog" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Changelog — What's New in Crixy AI" },
      { name: "twitter:description", content: "Follow the latest features, integrations, improvements and fixes shipped to Crixy AI as we build the all-in-one AI business workspace." },
    ],
    links: [{ rel: "canonical", href: "https://usecrixy.com/changelog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://usecrixy.com/" },
            { "@type": "ListItem", position: 2, name: "Changelog", item: "https://usecrixy.com/changelog" },
          ],
        }),
      },
    ],
  }),
  component: ChangelogPage,
});


function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-solid)] text-[rgb(var(--ink))]">
      <div className="border-b border-[var(--stroke-1)] bg-[var(--bg-solid)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--stroke-2)] bg-[rgb(var(--ink))] font-display font-bold text-[rgb(var(--ink-inv))]">C</div>
            <span className="font-display text-lg font-semibold">Crixy AI</span>
          </Link>
          <Link to="/" className="text-sm text-[var(--text-muted)] hover:text-[rgb(var(--ink))]">← Back home</Link>
        </div>
      </div>
      <h1 className="sr-only">Crixy AI Changelog — Product updates and new features</h1>
      <ChangelogFeed />
    </div>
  );
}
