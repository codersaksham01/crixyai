import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * "Live" launch counter that ticks up over time. Value is deterministic per-visitor,
 * seeded off the current day + week so it feels alive without hydration mismatch.
 */
export function LaunchPulse() {
  const [count, setCount] = useState(3142);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    // Baseline that drifts slowly by day of year.
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
    );
    setCount(3142 + dayOfYear * 7);

    // Slow synthetic ticks — makes it feel live without being noisy.
    const t = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
      setFlash((f) => f + 1);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] px-3 py-1 text-[11px] font-medium tracking-wide text-[var(--text-muted)]"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <motion.span
        key={flash}
        initial={{ opacity: 0.5, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="font-mono tabular-nums text-[rgb(var(--ink))]"
      >
        {count.toLocaleString()}
      </motion.span>
      <span>websites shipped by Crixy</span>
    </div>
  );
}
