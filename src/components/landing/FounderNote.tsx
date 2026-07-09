import { motion, type Variants } from "framer-motion";
import { Linkedin } from "lucide-react";
import founderUrl from "@/assets/founder-saksham.jpg";


/**
 * Premium scroll-reveal system:
 *   container   → orchestrates a smooth cascade for its children
 *   item        → per-child fade + rise + soft blur, custom cubic-bezier
 */
const EASE_OUT = [0.16, 1, 0.3, 1] as const; // very soft, "premium" landing
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

const portrait: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.1, ease: EASE_OUT },
  },
};

export function FounderNote() {
  return (
    <section className="relative overflow-hidden border-y border-[var(--stroke-1)] bg-[var(--surface-1)]">
      {/* Ambient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgb(var(--ink)/0.08), transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full"
        style={{ background: "radial-gradient(circle, rgb(var(--ink)/0.05), transparent 60%)" }}
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        variants={container}
        className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-[minmax(0,320px)_1fr] md:gap-20 lg:py-32"
      >
        {/* Portrait column */}
        <motion.div variants={portrait} className="relative mx-auto w-full max-w-[300px]">
          <div className="group relative overflow-hidden rounded-[28px] border border-[var(--stroke-2)] bg-black shadow-[0_30px_80px_-40px_rgb(0_0_0_/_0.55)]">
            <img
              src={founderUrl}
              alt="Saksham Singh, founder of Crixy AI"
              width={300}
              height={375}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover grayscale-[0.2] transition duration-700 ease-out group-hover:grayscale-0 group-hover:scale-[1.03]"
              draggable={false}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{ background: "linear-gradient(to bottom, rgb(0 0 0 / 0.25), transparent)" }}
            />
            {/* corner brackets */}
            <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-white/40" />
            <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-white/40" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/40" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/40" />
          </div>

          <motion.div
            variants={item}
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] px-4 py-3"
          >
            <div className="min-w-0">
              <div className="font-display text-[15px] font-semibold tracking-tight text-[rgb(var(--ink))]">
                Saksham Singh
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Founder & CEO
              </div>
            </div>
            <a
              href="https://www.linkedin.com/in/saksham-singh-ba591638a"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Saksham Singh on LinkedIn"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[rgb(var(--ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.35)]"
            >
              <Linkedin className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>

        </motion.div>

        {/* Letter column */}
        <div className="relative">
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--text-faint)]"
          >
            <span className="h-px w-10 bg-[var(--stroke-2)]" />
            A note from the founder
          </motion.div>

          <motion.blockquote
            variants={item}
            className="max-w-2xl font-serif-italic text-[26px] leading-[1.35] text-[rgb(var(--ink))] tracking-[-0.005em] sm:text-[30px] lg:text-[34px]"
          >
            <p>
              I built Crixy because I was tired of paying{" "}
              <span className="not-italic font-display font-semibold text-[rgb(var(--ink))]">eleven</span>{" "}
              subscriptions to run a two-person business. I wanted{" "}
              <span className="not-italic font-display font-semibold text-[rgb(var(--ink))]">one</span>{" "}
              place — where the website, the chatbot, the outreach and the
              numbers all knew each other.
            </p>
            <p className="mt-5">
              Not more AI features. <span className="not-italic font-display font-medium text-[rgb(var(--ink)/0.75)]">Fewer tabs.</span>{" "}
              <span className="not-italic font-display font-medium text-[rgb(var(--ink)/0.75)]">Softer edges.</span>{" "}
              <span className="not-italic font-display font-medium text-[rgb(var(--ink)/0.75)]">Real leverage.</span>
            </p>
          </motion.blockquote>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl font-sans text-[15px] leading-relaxed text-[var(--text-muted)]"
          >
            If that sounds like the tool you wish existed too — come build it with us.
          </motion.p>

          {/* Animated signature */}
          <motion.div variants={item} className="mt-8">
            <svg viewBox="0 0 320 90" className="h-14 w-auto" aria-hidden>
              <motion.path
                d="M6 62 C 26 20, 52 78, 80 44 C 100 22, 116 66, 140 46 C 160 30, 172 70, 196 50 C 220 32, 240 68, 260 48 C 274 34, 296 58, 314 42"
                fill="none"
                stroke="rgb(var(--ink))"
                strokeWidth="1.75"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 1.8, ease: EASE_OUT, delay: 0.5 }}
              />
            </svg>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--text-faint)]">
              — Saksham
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
