import { useRef, useState } from "react";

/** Drag/hover to reveal — "before" (messy stack) vs "after" (one Crixy dashboard). */
export function BeforeAfterSlider() {
  const wrap = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(52);
  const setFromEvent = (clientX: number) => {
    const el = wrap.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPct(Math.max(4, Math.min(96, p)));
  };
  return (
    <div
      ref={wrap}
      className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] select-none touch-none"
      onMouseMove={(e) => e.buttons === 1 && setFromEvent(e.clientX)}
      onMouseDown={(e) => setFromEvent(e.clientX)}
      onTouchStart={(e) => setFromEvent(e.touches[0].clientX)}
      onTouchMove={(e) => setFromEvent(e.touches[0].clientX)}
    >
      {/* BEFORE — messy tool stack */}
      <div className="absolute inset-0 bg-[var(--surface-1)]">
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-[var(--stroke-1)] bg-[var(--bg-solid)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
          Before · your current stack
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid grid-cols-4 gap-3 opacity-90">
            {["Webflow","Buffer","Intercom","HubSpot","Jasper","GA4","Zapier","Instantly"].map((t, i) => (
              <div
                key={t}
                className="rounded-xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] px-3 py-3 text-center font-display text-[11px] tracking-widest text-[var(--text-muted)]"
                style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (1 + i * 0.6)}deg)` }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AFTER — Crixy dashboard */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-2)] to-transparent" />
        <div className="absolute right-4 top-4 rounded-full border border-[var(--stroke-2)] bg-[rgb(var(--ink))] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--ink-inv))]">
          After · Crixy AI
        </div>
        <div className="absolute inset-0 p-8">
          <div className="mx-auto flex h-full max-w-lg flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--stroke-2)] bg-[rgb(var(--ink))] font-display font-bold text-[rgb(var(--ink-inv))]">C</div>
              <div className="font-display text-lg font-semibold text-[rgb(var(--ink))]">Crixy Workspace</div>
              <span className="ml-auto rounded-full border border-[var(--stroke-1)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">Live</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Website","Chatbot","Content","Outreach","CRM","Analytics"].map((k) => (
                <div key={k} className="rounded-lg border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">{k}</div>
                  <div className="mt-1 font-display text-lg text-[rgb(var(--ink))]">OK</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-3">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Pipeline this month</span><span>+184%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div className="h-full w-3/4 bg-[rgb(var(--ink))]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Handle */}
      <div className="absolute top-0 h-full w-px bg-[rgb(var(--ink)/0.35)]" style={{ left: `${pct}%` }} />
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-10 w-10 cursor-ew-resize place-items-center rounded-full border border-[var(--stroke-2)] bg-[var(--bg-solid)] text-[rgb(var(--ink))] shadow-lg"
        style={{ left: `${pct}%` }}
        aria-label="Drag to compare"
      >
        <span className="font-mono text-[10px]">‹ ›</span>
      </div>
    </div>
  );
}
