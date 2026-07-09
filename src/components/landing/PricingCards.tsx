import { Check } from "lucide-react";
import { Magnetic } from "@/components/landing/MagneticButton";

const WHATSAPP_NUMBER = "918962890425";

type PlanCopy = { intro: string; ask: string };
const PLAN_MESSAGES: Record<string, PlanCopy> = {
  Starter: {
    intro: "I'd like to start with the free Starter plan on Crixy AI.",
    ask: "Can you help me set up my account and walk me through what's included?",
  },
  Growth: {
    intro: "I'm interested in the Growth plan on Crixy AI ($49/mo founder pricing).",
    ask: "Could you share how onboarding works and how soon I can go live?",
  },
  Scale: {
    intro: "I'd like to talk to sales about the Scale plan on Crixy AI ($149/mo).",
    ask: "Can we set up a quick call to discuss team seats, integrations and rollout?",
  },
};

const buildWhatsAppUrl = (rawPlanName: string) => {
  const planName = (rawPlanName ?? "").trim() || "Crixy AI";
  const copy = PLAN_MESSAGES[planName] ?? {
    intro: `I'm interested in the ${planName} plan on Crixy AI.`,
    ask: "Could you share more details?",
  };
  const message = [
    "Hi Saksham 👋",
    "",
    copy.intro,
    copy.ask,
    "",
    `Selected plan: ${planName}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const PLANS = [
  {
    name: "Starter",
    tag: "For solo founders",
    price: 0,
    origPrice: 29,
    features: ["Website + chatbot", "Content generator (30/mo)", "Basic CRM", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    tag: "Most operators pick this",
    price: 49,
    origPrice: 99,
    features: [
      "Everything in Starter",
      "Unlimited content + scheduling",
      "Cold outreach + inbox",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Get founder pricing",
    highlight: true,
  },
  {
    name: "Scale",
    tag: "For growing teams",
    price: 149,
    origPrice: 299,
    features: [
      "Everything in Growth",
      "Team seats + roles",
      "Voice + WhatsApp agents (early access)",
      "Custom integrations",
      "Dedicated success",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {PLANS.map((p) => (
        <div
          key={p.name}
          className={
            "relative flex flex-col rounded-3xl border p-6 transition-transform duration-300 hover:-translate-y-0.5 " +
            (p.highlight
              ? "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))] shadow-[0_30px_60px_-30px_rgb(var(--ink)/0.5)]"
              : "border-[var(--stroke-1)] bg-[var(--surface-1)] text-[rgb(var(--ink))] hover:border-[var(--stroke-2)]")
          }
        >
          {p.highlight && (
            <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[rgb(var(--ink-inv)/0.2)] bg-[rgb(var(--ink-inv))] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--ink))] shadow-[0_10px_24px_-12px_rgb(var(--ink)/0.5)]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--ink))]" />
              Most popular · Founder pricing
            </div>
          )}
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{p.name}</h2>
            <span className={"text-[10px] uppercase tracking-[0.18em] sm:text-[11px] " + (p.highlight ? "opacity-70" : "text-[var(--text-faint)]")}>
              {p.tag}
            </span>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold tracking-tight">${p.price}</span>
            <span className={"text-sm " + (p.highlight ? "opacity-70" : "text-[var(--text-muted)]")}>/mo</span>
            <span className={"ml-2 text-sm line-through " + (p.highlight ? "opacity-50" : "text-[var(--text-faint)]")} aria-label={`Regular price ${p.origPrice} dollars`}>${p.origPrice}</span>
          </div>
          <ul className="mt-6 flex-1 space-y-2 text-sm md:min-h-[180px]">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check aria-hidden className={"mt-0.5 h-4 w-4 shrink-0 " + (p.highlight ? "" : "text-[rgb(var(--ink))]")} />
                <span className={p.highlight ? "opacity-90" : "text-[var(--text-muted)]"}>{f}</span>
              </li>
            ))}
          </ul>
          <Magnetic
            as="a"
            href={buildWhatsAppUrl(p.name)}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel={`${p.cta} — ${p.name} plan, opens WhatsApp`}
            className={
              "mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-solid)] " +
              (p.highlight
                ? "bg-[rgb(var(--ink-inv))] text-[rgb(var(--ink))] hover:opacity-90"
                : "border border-[rgb(var(--ink))] bg-transparent text-[rgb(var(--ink))] hover:bg-[var(--surface-2)]")
            }
          >
            {p.cta}
          </Magnetic>
        </div>
      ))}
    </div>
  );
}
