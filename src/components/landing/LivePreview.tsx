import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Analysing your business…",
  "Drafting brand voice & palette…",
  "Generating website structure…",
  "Training AI chatbot on your docs…",
  "Composing 30-day content plan…",
  "Setting up CRM & workflows…",
];

export function LivePreview() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p + 1) % (STEPS.length + 1));
    }, 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-3 shadow-2xl noise">
      {/* Window chrome */}
      <div className="flex items-center justify-between rounded-t-lg border border-white/10 bg-black/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-0.5 font-mono text-[11px] text-white/60">
          crixy.ai/build/northwind-coffee
        </div>
        <span className="w-10" />
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-b-lg border-x border-b border-white/10 bg-black/40 p-3 md:grid-cols-[1fr_1.2fr]">
        {/* Left: build log */}
        <div className="rounded-lg border border-white/10 bg-black/60 p-3">
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
            Build log
          </div>
          <ul className="space-y-2 font-mono text-[12px]">
            {STEPS.map((s, i) => {
              const done = i < progress;
              const doing = i === progress;
              return (
                <li key={s} className="flex items-center gap-2">
                  {done ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : doing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-white/20" />
                  )}
                  <span className={done ? "text-white/80" : doing ? "text-white" : "text-white/40"}>
                    {s}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-white transition-all duration-700"
              style={{ width: `${Math.min(100, (progress / STEPS.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Right: fake generated site */}
        <div className="rounded-lg border border-white/10 bg-white p-4 text-black">
          <div className="flex items-center justify-between border-b border-black/10 pb-2 text-[11px]">
            <div className="flex items-center gap-2 font-display font-semibold">
              <span className="grid h-5 w-5 place-items-center rounded bg-black text-white">N</span>
              Northwind Coffee
            </div>
            <div className="hidden gap-3 text-black/60 sm:flex">
              <span>Menu</span><span>Story</span><span>Visit</span>
            </div>
          </div>
          <div className="pt-3">
            <div className="font-display text-[22px] font-semibold leading-tight">
              Slow-roasted, <span className="font-serif-italic text-black/70">honestly</span> good.
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-black/60">
              Single-origin beans, small batches, delivered to your door every Friday. Est. 2019.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="rounded bg-black px-2 py-1 text-[10px] text-white">Shop beans</span>
              <span className="rounded border border-black/20 px-2 py-1 text-[10px]">Book tasting</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="aspect-square rounded bg-black/80" />
              <div className="aspect-square rounded bg-black/50" />
              <div className="aspect-square rounded bg-black/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
