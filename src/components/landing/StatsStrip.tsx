import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const STATS = [
  { n: 8, suffix: "", label: "Tools replaced" },
  { n: 12, suffix: "h", label: "Saved per week" },
  { n: 3, suffix: "m", label: "To first launch" },
  { n: 94, suffix: "%", label: "Founder love" },
];

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <section ref={ref} className="border-y border-[var(--stroke-1)] bg-[var(--surface-1)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="bg-[var(--bg-solid)] p-8 text-center"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="font-display text-5xl font-semibold tracking-tight text-[rgb(var(--ink))] sm:text-6xl">
              {inView ? <CountUp to={s.n} /> : "0"}
              <span className="font-serif-italic text-[rgb(var(--ink)/0.6)]">{s.suffix}</span>
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-faint)]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CountUp({ to, dur = 1400 }: { to: number; dur?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <>{v}</>;
}
