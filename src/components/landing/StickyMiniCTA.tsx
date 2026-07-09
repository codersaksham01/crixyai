import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useWaitlist } from "./WaitlistDialog";

/** Floating CTA that appears after the hero scrolls out of view. */
export function StickyMiniCTA() {
  const { open } = useWaitlist();
  const { scrollY } = useScroll();
  const [scrolledEnough, setScrolledEnough] = useState(false);
  // Suppress the mini-CTA until the intro overlay has finished, so it doesn't
  // pop over the boot animation on first load.
  const [introDone, setIntroDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.sessionStorage.getItem("crixy-intro-seen") === "1";
    } catch {
      return true;
    }
  });

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolledEnough(y > 640);
  });

  useEffect(() => {
    if (introDone) return;
    // Poll until the intro sets its "seen" flag (cheap: 6× at most).
    const id = window.setInterval(() => {
      try {
        if (window.sessionStorage.getItem("crixy-intro-seen") === "1") {
          setIntroDone(true);
          window.clearInterval(id);
        }
      } catch {
        setIntroDone(true);
        window.clearInterval(id);
      }
    }, 500);
    // Safety: give up after 6s regardless.
    const stop = window.setTimeout(() => window.clearInterval(id), 6000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [introDone]);

  const show = scrolledEnough && introDone;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="mini-cta"
          type="button"
          onClick={() => open("sticky")}
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 right-5 z-[140] inline-flex items-center gap-2 rounded-full bg-[rgb(var(--ink))] px-4 py-2.5 text-[13px] font-medium text-[rgb(var(--ink-inv))] shadow-[0_18px_45px_-12px_rgb(0_0_0_/_0.55)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.4)] sm:bottom-8 sm:right-8"
          aria-label="Join the waitlist"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--ink-inv))]/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--ink-inv))]" />
          </span>
          Join the waitlist
          <ArrowUpRight className="h-3.5 w-3.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

