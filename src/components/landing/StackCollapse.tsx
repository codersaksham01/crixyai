import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const TOOLS = ["Webflow","Buffer","Intercom","HubSpot","Jasper","GA4","Zapier","Instantly"];

/** On scroll into view, 8 tool tiles fall & merge into a single Crixy tile. */
export function StackCollapse() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <div ref={ref} className="relative mx-auto flex h-[380px] w-full max-w-3xl items-center justify-center">
      {TOOLS.map((t, i) => {
        const angle = (i / TOOLS.length) * Math.PI * 2;
        const R = 220;
        const x = Math.cos(angle) * R;
        const y = Math.sin(angle) * R * 0.55;
        return (
          <motion.div
            key={t}
            initial={{ x, y, opacity: 1, rotate: (i % 2 ? 1 : -1) * 6, scale: 1 }}
            animate={inView ? { x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.6 } : {}}
            transition={{ duration: 1, delay: 0.15 + i * 0.06, ease: [0.7, 0, 0.2, 1] }}
            className="absolute rounded-xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] px-4 py-2 font-display text-[12px] tracking-[0.2em] text-[var(--text-muted)]"
          >
            {t.toUpperCase()}
          </motion.div>
        );
      })}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.9, ease: [0.6, 0, 0.2, 1] }}
        className="relative z-10 flex items-center gap-3 rounded-2xl border border-[var(--stroke-2)] bg-[rgb(var(--ink))] px-6 py-4 text-[rgb(var(--ink-inv))] shadow-2xl"
      >
        <div className="grid h-10 w-10 place-items-center rounded-md border border-[rgb(var(--ink-inv)/0.3)] font-display text-lg font-bold">C</div>
        <div>
          <div className="font-display text-lg font-semibold">Crixy AI</div>
          <div className="text-[11px] opacity-70">One workspace, everything above</div>
        </div>
      </motion.div>
    </div>
  );
}
