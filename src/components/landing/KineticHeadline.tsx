import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["launch", "market", "scale", "automate", "grow"];

/** Big display heading with per-word reveal and rotating italic word. */
export function KineticHeadline() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  const staticLine = "One workspace to";
  const tailLine = "your business.";
  const line2Prefix = "and run";

  return (
    <h1 className="font-display text-[clamp(2rem,10vw,2.75rem)] font-semibold leading-[1.05] tracking-tight sm:text-6xl sm:leading-[1.02] lg:text-[76px]">
      <WordsReveal text={staticLine} />{" "}
      <span
        className="relative inline-block overflow-hidden pb-[0.15em] align-baseline text-[rgb(var(--ink)/0.85)]"
        style={{ verticalAlign: "baseline" }}
      >
        {/* Invisible sizer keeps the slot wide enough for the longest word so the
            rotating word never collapses to the left or jumps the layout. */}
        <span aria-hidden className="invisible font-serif-italic whitespace-nowrap">
          {WORDS.reduce((a, b) => (a.length >= b.length ? a : b))}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={WORDS[i]}
            initial={{ y: "0.6em", opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-0.6em", opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.6, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-baseline justify-center font-serif-italic whitespace-nowrap"
          >
            {WORDS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
      <br />
      <WordsReveal text={line2Prefix} delay={0.15} />{" "}
      <WordsReveal text={tailLine} delay={0.3} />
    </h1>
  );
}

function WordsReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className="inline">
      {words.map((w, idx) => (
        <span key={idx} className="inline-block overflow-hidden pb-[0.22em] align-baseline leading-[1.15]">
          <motion.span
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: delay + idx * 0.06, ease: [0.6, 0, 0.2, 1] }}
            className="inline-block leading-[1.05]"
          >
            {w}
            {idx < words.length - 1 && <>&nbsp;</>}
          </motion.span>
        </span>

      ))}
    </span>
  );
}
