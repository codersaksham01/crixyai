import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoUrl from "@/assets/crixy-logo.jpg";

const BOOT_LINES = [
  "booting crixy runtime",
  "loading agent graph",
  "linking workspace modules",
  "warming inference cache",
  "ready",
];

const DURATION_MS = 2200;

/** Techy branded loader: logo, scan ring, progress bar, boot log. */
export function IntroOverlay() {
  // Must match SSR output on first render — start visible, then hide in an
  // effect if sessionStorage says we've already shown it. Anything smarter
  // (reading sessionStorage in the initializer) causes a hydration mismatch.
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem("crixy-intro-seen") === "1";
    } catch {}
    if (seen) {
      // Hide immediately — the AnimatePresence exit still plays a quick fade.
      setShow(false);
      return;
    }

    let isReduced = false;
    try {
      isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
    setReduced(isReduced);

    const runFor = isReduced ? 400 : DURATION_MS;

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / runFor) * 100);
      setProgress(pct);
      setLineIdx(Math.min(BOOT_LINES.length - 1, Math.floor((pct / 100) * BOOT_LINES.length)));
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem("crixy-intro-seen", "1");
      } catch {}
    }, runFor + 200);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-8%" }}
          transition={{ duration: 0.7, ease: [0.85, 0, 0.15, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[var(--bg-solid)]"
          aria-label="Loading Crixy AI"
          role="status"
        >
          {/* Grid backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgb(var(--ink) / 0.08) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--ink) / 0.08) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
              maskImage:
                "radial-gradient(circle at center, black 40%, transparent 75%)",
            }}
          />
          {/* Soft vignette */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, transparent 40%, var(--bg-solid) 80%)",
            }}
          />

          {/* Corner brackets */}
          <CornerBrackets />

          <div className="relative flex flex-col items-center">
            {/* Logo + scan ring */}
            <div className="relative mb-8 grid h-28 w-28 place-items-center">
              {!reduced && (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-full border border-[rgb(var(--ink)/0.25)]"
                    animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute inset-0 rounded-full border border-[rgb(var(--ink)/0.2)]"
                    animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-[-4px] rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, rgb(var(--ink)/0.55) 40deg, transparent 80deg)",
                      WebkitMask:
                        "radial-gradient(circle, transparent 54%, black 55%, black 58%, transparent 59%)",
                      mask: "radial-gradient(circle, transparent 54%, black 55%, black 58%, transparent 59%)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  />
                </>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative grid h-20 w-20 place-items-center rounded-2xl border border-[var(--stroke-2)] bg-black shadow-[0_0_60px_-15px_rgb(var(--ink)/0.5)]"
              >
                <img
                  src={logoUrl}
                  alt="Crixy AI"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 object-contain"
                  draggable={false}
                />
              </motion.div>
            </div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-display text-2xl font-semibold tracking-tight text-[rgb(var(--ink))]"
            >
              Crixy<span className="text-[rgb(var(--ink)/0.55)]"> AI</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-1 text-[10px] uppercase tracking-[0.4em] text-[var(--text-faint)]"
            >
              AI Business Workspace
            </motion.div>

            {/* Progress + boot log */}
            <div className="mt-10 w-[min(320px,72vw)]">
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgb(var(--ink)/0.08)]">
                <motion.div
                  className="h-full rounded-full bg-[rgb(var(--ink))]"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.05 }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--ink))]" />
                  {BOOT_LINES[lineIdx]}
                </span>
                <span>{Math.floor(progress).toString().padStart(2, "0")}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CornerBrackets() {
  const base =
    "absolute h-6 w-6 border-[rgb(var(--ink)/0.35)] pointer-events-none";
  return (
    <>
      <span className={`${base} left-6 top-6 border-l border-t`} />
      <span className={`${base} right-6 top-6 border-r border-t`} />
      <span className={`${base} bottom-6 left-6 border-b border-l`} />
      <span className={`${base} bottom-6 right-6 border-b border-r`} />
    </>
  );
}
