import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Paperclip, Globe, Bot, Sparkles, Mail, Wand2, Loader2, Check, RefreshCcw } from "lucide-react";
import { useWaitlist } from "@/components/landing/WaitlistDialog";

const TOOL_OPTIONS = [
  { icon: Globe, label: "Website" },
  { icon: Bot, label: "Chatbot" },
  { icon: Sparkles, label: "Content" },
  { icon: Mail, label: "Outreach" },
];

const USE_CASES = [
  { id: "agency",   label: "Agency",     prompt: "Launch a 5-page site for my branding agency + write 30 days of LinkedIn posts." },
  { id: "shop",     label: "E-commerce", prompt: "Build a Shopify-style store for my candle brand and a chatbot that recommends scents." },
  { id: "clinic",   label: "Clinic",     prompt: "Set up a website and appointment chatbot for my dental clinic in Berlin." },
  { id: "saas",     label: "SaaS",       prompt: "Cold-email 200 fintech founders and follow up until they reply. Track everything." },
  { id: "creator",  label: "Creator",    prompt: "Grow my newsletter to 10k — landing page, social hooks and a weekly content plan." },
];

/** Live plan-of-work streamed word-by-word based on prompt + use-case + tools. */
export function InteractiveComposer() {
  const { open: openWaitlist } = useWaitlist();
  const [tab, setTab] = useState(USE_CASES[0].id);
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [active, setActive] = useState<string[]>(["Website", "Content"]);
  const [streaming, setStreaming] = useState<null | { steps: string[]; typed: string[] }>(null);
  const idxRef = useRef({ i: 0, j: 0, deleting: false });

  const activeCase = useMemo(() => USE_CASES.find((c) => c.id === tab)!, [tab]);

  // Rotating placeholder from the use case's example prompt
  useEffect(() => {
    if (value || streaming) return;
    let raf: number;
    let last = performance.now();
    const source = activeCase.prompt;
    idxRef.current = { i: 0, j: 0, deleting: false };
    const tick = (now: number) => {
      const state = idxRef.current;
      const speed = state.deleting ? 22 : 34;
      if (now - last > speed) {
        last = now;
        if (!state.deleting) {
          state.j += 1;
          setPlaceholder(source.slice(0, state.j));
          if (state.j >= source.length) { state.deleting = true; last = now + 1600; }
        } else {
          state.j -= 1;
          setPlaceholder(source.slice(0, Math.max(0, state.j)));
          if (state.j <= 0) state.deleting = false;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeCase, value, streaming]);

  const toggleTool = (label: string) =>
    setActive((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  const generate = () => {
    const prompt = value.trim() || activeCase.prompt;
    const steps = buildPlan(prompt, active);
    setStreaming({ steps, typed: steps.map(() => "") });
    streamOut(steps, (typed) => setStreaming({ steps, typed }));
    openWaitlist("composer");
  };

  const reset = () => { setStreaming(null); setValue(""); };

  return (
    <div className="rise-in">
      {/* Use-case tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">I'm building for</span>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] p-1">
          {USE_CASES.map((c) => {
            const on = tab === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { setTab(c.id); setStreaming(null); }}
                className={
                  "rounded-full px-3 py-1 text-[12px] transition " +
                  (on ? "bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]" : "text-[var(--text-muted)] hover:text-[rgb(var(--ink))]")
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); generate(); }}
        className="group relative rounded-[22px] border border-[var(--stroke-1)] bg-[var(--surface-1)] p-2 shadow-[0_30px_80px_-30px_rgb(var(--ink)/0.25),_inset_0_1px_0_rgb(var(--ink)/0.05)] backdrop-blur-xl transition focus-within:border-[var(--stroke-2)]"
      >
        <div className="flex items-center justify-between gap-2 px-3 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
            <Wand2 className="h-3 w-3" /> Crixy Composer
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {TOOL_OPTIONS.map(({ icon: Icon, label }) => {
              const on = active.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleTool(label)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition " +
                    (on
                      ? "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]"
                      : "border-[var(--stroke-1)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:border-[var(--stroke-2)] hover:text-[rgb(var(--ink))]")
                  }
                >
                  <Icon className="h-3 w-3" /> {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative px-3 pb-1 pt-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent px-1 py-2 font-mono text-[15px] leading-relaxed text-[rgb(var(--ink))] placeholder:text-[var(--text-faint)] focus:outline-none"
            placeholder={placeholder || "Describe what you want Crixy to build…"}
          />
          {!value && !streaming && (
            <span className="pointer-events-none absolute left-4 top-[42px] font-mono text-[15px] text-[var(--text-faint)]">
              <span className="opacity-0">{placeholder}</span>
              <span className="caret ml-0.5 inline-block h-4 w-[7px] translate-y-0.5 align-middle" />
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--stroke-1)] px-3 py-2">
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <button type="button" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]">
              <Paperclip className="h-4 w-4" />
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]">
              <Globe className="h-4 w-4" />
            </button>
            <span className="ml-1 hidden text-[11px] text-[var(--text-faint)] sm:inline">
              Attach brand · Connect data · No credit card
            </span>
          </div>
          <button
            type="submit"
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[rgb(var(--ink))] px-4 py-2 text-sm font-medium text-[rgb(var(--ink-inv))] transition hover:opacity-90 sheen"
          >
            Generate plan <ArrowUp className="h-4 w-4 rotate-45" />
          </button>
        </div>
      </form>

      {/* Streaming output */}
      <AnimatePresence>
        {streaming && (
          <motion.div
            key="stream"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            className="mt-3 overflow-hidden rounded-[22px] border border-[var(--stroke-1)] bg-[var(--surface-1)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--stroke-1)] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--ink))]" />
                Crixy is drafting your workspace
              </span>
              <button onClick={reset} className="inline-flex items-center gap-1 hover:text-[rgb(var(--ink))]">
                <RefreshCcw className="h-3 w-3" /> reset
              </button>
            </div>
            <ol className="divide-y divide-[var(--stroke-1)]">
              {streaming.steps.map((full, i) => {
                const typed = streaming.typed[i];
                const done = typed.length >= full.length;
                const running = !done && (i === 0 || streaming.typed[i - 1].length >= streaming.steps[i - 1].length);
                return (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm text-[rgb(var(--ink))]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[var(--stroke-1)]">
                      {done ? <Check className="h-3 w-3" /> : running ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="h-1 w-1 rounded-full bg-[var(--text-faint)]" />}
                    </span>
                    <span className="font-mono leading-relaxed text-[13px]">
                      {typed}
                      {!done && running && <span className="caret ml-0.5 inline-block h-3.5 w-[6px] translate-y-0.5 align-middle" />}
                    </span>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function buildPlan(prompt: string, tools: string[]): string[] {
  const p = prompt.length > 90 ? prompt.slice(0, 87) + "…" : prompt;
  const base = [
    `Understanding: "${p}"`,
    "Extracting brand tone, industry and target audience from your input",
  ];
  const t: string[] = [];
  if (tools.includes("Website")) t.push("Generating a 5-page website: hero, product, story, pricing, contact");
  if (tools.includes("Chatbot")) t.push("Deploying an AI chatbot trained on your pages and documents");
  if (tools.includes("Content")) t.push("Drafting a 30-day content plan across LinkedIn, X and Instagram");
  if (tools.includes("Outreach")) t.push("Composing a 3-touch cold email sequence for your ICP");
  if (!t.length) t.push("Assembling default workspace: website + chatbot + content plan");
  return [...base, ...t, "Wiring analytics + CRM and scheduling first publish for tomorrow 09:00"];
}

function streamOut(steps: string[], onUpdate: (typed: string[]) => void) {
  const typed = steps.map(() => "");
  let stepIdx = 0;
  let charIdx = 0;
  const tick = () => {
    if (stepIdx >= steps.length) return;
    charIdx += Math.max(1, Math.round(Math.random() * 3));
    typed[stepIdx] = steps[stepIdx].slice(0, charIdx);
    onUpdate([...typed]);
    if (charIdx >= steps[stepIdx].length) {
      stepIdx += 1; charIdx = 0;
      setTimeout(tick, 220);
    } else {
      setTimeout(tick, 22);
    }
  };
  tick();
}
