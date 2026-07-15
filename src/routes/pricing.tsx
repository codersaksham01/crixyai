import { createFileRoute, Link } from "@tanstack/react-router";
import { PricingCards } from "@/components/landing/PricingCards";

const PRICING_URL = "https://usecrixy.com/pricing";
const PRICING_TITLE = "Pricing — Crixy AI | All-in-One AI Workspace Plans";
const PRICING_DESC =
  "Simple, founder-friendly pricing for the all-in-one AI workspace — websites, chatbots, CRM, outreach and analytics. Free Starter, $49 Growth, $149 Scale.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: PRICING_TITLE },
      { name: "description", content: PRICING_DESC },
      { property: "og:title", content: PRICING_TITLE },
      { property: "og:description", content: PRICING_DESC },
      { property: "og:url", content: PRICING_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: PRICING_TITLE },
      { name: "twitter:description", content: PRICING_DESC },
    ],
    links: [{ rel: "canonical", href: PRICING_URL }],
    scripts: [
      // Product schema with one Offer per plan — enables price/plan
      // rich results ("From $0/mo") in Google.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Crixy AI",
          description: PRICING_DESC,
          brand: { "@type": "Brand", name: "Crixy AI" },
          url: PRICING_URL,
          offers: [
            {
              "@type": "Offer",
              name: "Starter",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: PRICING_URL,
            },
            {
              "@type": "Offer",
              name: "Growth",
              price: "49",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: PRICING_URL,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "49",
                priceCurrency: "USD",
                unitText: "MONTH",
              },
            },
            {
              "@type": "Offer",
              name: "Scale",
              price: "149",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: PRICING_URL,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "149",
                priceCurrency: "USD",
                unitText: "MONTH",
              },
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://usecrixy.com/" },
            { "@type": "ListItem", position: 2, name: "Pricing", item: PRICING_URL },
          ],
        }),
      },
    ],
  }),
  component: PricingPage,
});


function PricingPage() {
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
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[var(--text-faint)] text-center">Founder pricing</div>
        <h1 className="text-center font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          One subscription. <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">Eight tools quieter.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-[var(--text-muted)]">
          Lock in launch pricing during beta. Cancel any time. No credit card required for Starter.
        </p>
        <div className="mt-14"><PricingCards /></div>
      </section>
    </div>
  );
}
