import { createFileRoute, Link } from "@tanstack/react-router";

const CUSTOMERS_URL = "https://usecrixy.com/customers";
const CUSTOMERS_TITLE = "Customer Stories — How Founders Use Crixy AI";
const CUSTOMERS_DESC =
  "See how small businesses and founders use Crixy AI's all-in-one workspace to launch sites, run cold outreach and grow — real workspaces, real numbers.";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: CUSTOMERS_TITLE },
      { name: "description", content: CUSTOMERS_DESC },
      { property: "og:title", content: CUSTOMERS_TITLE },
      { property: "og:description", content: CUSTOMERS_DESC },
      { property: "og:url", content: CUSTOMERS_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: CUSTOMERS_TITLE },
      { name: "twitter:description", content: CUSTOMERS_DESC },
    ],
    links: [{ rel: "canonical", href: CUSTOMERS_URL }],
    scripts: [
      // BreadcrumbList — helps Google show the /customers path in the SERP.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://usecrixy.com/" },
            { "@type": "ListItem", position: 2, name: "Customers", item: CUSTOMERS_URL },
          ],
        }),
      },
    ],
  }),
  component: CustomersPage,
});


const STORIES = [
  { brand: "Northwind Coffee", stat: "70%", note: "of support handled by Crixy chatbot", detail: "Replaced Zendesk + a $600/mo chat plugin" },
  { brand: "Vertex Labs", stat: "6 calls", note: "booked in week one via cold outreach", detail: "Zero SDR. All Crixy-generated sequences" },
  { brand: "Kilometre Studio", stat: "12h/wk", note: "returned to the founder", detail: "Killed Webflow, Buffer and half of HubSpot" },
];

function CustomersPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-solid)] text-[rgb(var(--ink))]">
      <SubNav />
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[var(--text-faint)]">Customers</div>
        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          The teams shipping fastest <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">already run on Crixy.</span>
        </h1>
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STORIES.map((s) => (
            <div key={s.brand} className="rounded-3xl border border-[var(--stroke-1)] bg-[var(--surface-1)] p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">{s.brand}</div>
              <div className="mt-6 font-display text-5xl font-semibold tracking-tight">{s.stat}</div>
              <div className="mt-2 text-sm text-[rgb(var(--ink))]">{s.note}</div>
              <div className="mt-4 border-t border-[var(--stroke-1)] pt-4 text-xs text-[var(--text-muted)]">{s.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SubNav() {
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
