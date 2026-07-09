import { createFileRoute, Link } from "@tanstack/react-router";
import { ChangelogFeed } from "@/components/landing/ChangelogFeed";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — What's New in Crixy AI" },
      { name: "description", content: "Everything shipped in Crixy AI — new AI features, integrations and improvements, week by week." },
      { property: "og:title", content: "Changelog — What's New in Crixy AI" },
      { property: "og:description", content: "Everything shipped in Crixy AI — new AI features, integrations and improvements, week by week." },
      { property: "og:url", content: "https://usecrixy.com/changelog" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Changelog — What's New in Crixy AI" },
      { name: "twitter:description", content: "Everything shipped in Crixy AI — new AI features and improvements, week by week." },
    ],
    links: [{ rel: "canonical", href: "https://usecrixy.com/changelog" }],
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
      <ChangelogFeed />
    </div>
  );
}
