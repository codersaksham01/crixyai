import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

const STACK = [
  { name: "Website (Webflow / Framer)", monthly: 39 },
  { name: "Chatbot (Intercom)", monthly: 74 },
  { name: "Content (Buffer)", monthly: 15 },
  { name: "Scheduler (Later)", monthly: 25 },
  { name: "Outreach (Instantly)", monthly: 37 },
  { name: "Analytics (Fathom)", monthly: 14 },
  { name: "CRM (HubSpot Starter)", monthly: 20 },
  { name: "Automation (Zapier)", monthly: 29 },
];

const CRIXY_PRICE = 79;

export function CostCalculator() {
  const [seats, setSeats] = useState(3);
  const [tools, setTools] = useState(6);

  const { stackCost, crixyCost, saved, pct } = useMemo(() => {
    // Pick the top N most-expensive tools as the user's stack proxy.
    const picked = [...STACK].sort((a, b) => b.monthly - a.monthly).slice(0, tools);
    const stackCost = picked.reduce((s, t) => s + t.monthly, 0) * Math.max(1, seats / 3);
    const crixyCost = CRIXY_PRICE + Math.max(0, seats - 3) * 15;
    const saved = Math.max(0, stackCost - crixyCost);
    const pct = stackCost > 0 ? Math.round((saved / stackCost) * 100) : 0;
    return {
      stackCost: Math.round(stackCost),
      crixyCost: Math.round(crixyCost),
      saved: Math.round(saved),
      pct,
    };
  }, [seats, tools]);

  return (
    <section
      id="calculator"
      className="relative mx-auto max-w-6xl px-6 py-24 lg:py-28"
    >
      <div className="mb-12 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--text-faint)]">
          <Wallet className="h-3.5 w-3.5" /> Cost calculator
        </div>
        <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          See what your stack{" "}
          <span className="font-serif-italic text-[rgb(var(--ink)/0.75)]">actually costs</span>{" "}
          you.
        </h2>
        <p className="mt-3 max-w-lg text-sm text-[var(--text-muted)]">
          Move the sliders. Real per-tool pricing, real numbers. Most teams save
          more than 60% within a month.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* Inputs */}
        <div className="rounded-3xl border border-[var(--stroke-1)] bg-[var(--surface-1)] p-6 sm:p-8">
          <Slider
            label="Team size"
            value={seats}
            min={1}
            max={25}
            unit="seat"
            unitPlural="seats"
            onChange={setSeats}
          />
          <div className="my-6 h-px w-full bg-[var(--stroke-1)]" />
          <Slider
            label="Tools you currently pay for"
            value={tools}
            min={2}
            max={STACK.length}
            unit="tool"
            unitPlural="tools"
            onChange={setTools}
          />

          <div className="mt-8 space-y-2">
            {[...STACK]
              .sort((a, b) => b.monthly - a.monthly)
              .slice(0, tools)
              .map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between rounded-lg bg-[var(--bg-solid)] px-3 py-2 text-[13px]"
                >
                  <span className="text-[var(--text-muted)]">{t.name}</span>
                  <span className="font-mono text-[12px] text-[rgb(var(--ink))]">
                    ${t.monthly}/mo
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--stroke-2)] bg-[rgb(var(--ink))] p-6 text-[rgb(var(--ink-inv))] sm:p-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--ink-inv))]/60">
              Your monthly saving
            </div>
            <motion.div
              key={saved}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl"
            >
              ${saved.toLocaleString()}
            </motion.div>
            <div className="mt-2 text-[13px] text-[rgb(var(--ink-inv))]/70">
              That's <span className="font-mono">{pct}%</span> less than your
              current stack.
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <Row label="Your current stack" value={`$${stackCost.toLocaleString()}/mo`} />
            <Row label="Crixy AI" value={`$${crixyCost.toLocaleString()}/mo`} accent />
            <div className="h-px w-full bg-[rgb(var(--ink-inv))]/15" />
            <Row
              label="Yearly saving"
              value={`$${(saved * 12).toLocaleString()}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  unitPlural,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  unitPlural: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-faint)]">
          {label}
        </label>
        <div className="font-mono text-[13px] text-[rgb(var(--ink))]">
          {value} {value === 1 ? unit : unitPlural}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="crixy-range w-full"
        aria-label={label}
      />
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[rgb(var(--ink-inv))]/65">{label}</span>
      <span
        className={
          "font-mono tabular-nums " +
          (accent ? "text-[rgb(var(--ink-inv))]" : "text-[rgb(var(--ink-inv))]/85")
        }
      >
        {value}
      </span>
    </div>
  );
}
