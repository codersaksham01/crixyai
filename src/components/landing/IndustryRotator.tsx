import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Pinned industries — the 5 verticals Crixy is prioritising during beta.
const INDUSTRIES = [
  "export",
  "real estate",
  "healthcare",
  "agencies",
  "ecommerce",
];

export function IndustryRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % INDUSTRIES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block min-w-[11ch] text-left align-baseline text-[rgb(var(--ink))]">
      <AnimatePresence mode="wait">
        <motion.span
          key={INDUSTRIES[i]}
          initial={{ y: "0.6em", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-0.6em", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block font-display font-semibold"
        >
          {INDUSTRIES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
