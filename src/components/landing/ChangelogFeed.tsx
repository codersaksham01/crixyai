const ENTRIES = [
  {
    date: "Jul 03",
    tag: "New",
    title: "Voice AI agents — early access",
    body: "Answer inbound calls, qualify leads and book meetings 24/7 with a natural-sounding agent trained on your business.",
  },
  {
    date: "Jun 24",
    tag: "Improved",
    title: "Chatbot v2 — handoffs & inbox",
    body: "The chatbot can now escalate to a shared inbox with full context, confidence score and suggested reply.",
  },
  {
    date: "Jun 12",
    tag: "New",
    title: "Instagram + LinkedIn scheduling",
    body: "Plan, approve and publish across both from the unified calendar.",
  },
  {
    date: "May 30",
    tag: "Fixed",
    title: "Cold outreach deliverability",
    body: "Auto-warmup and per-domain send caps improved reply rates by 34%.",
  },
];

export function ChangelogFeed() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24">
      <div className="mb-10 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-faint)]">
          <span className="h-px w-6 bg-[var(--stroke-2)]" /> Shipped this month
        </div>
        <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Product changelog — <span className="font-serif-italic text-[rgb(var(--ink)/0.7)]">shipped publicly.</span>
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">We ship every week. Here's everything new in Crixy AI.</p>
      </div>
      <ol className="relative border-l border-[var(--stroke-1)] pl-8">
        {ENTRIES.map((e) => (
          <li key={e.title} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[9px] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-[var(--stroke-2)] bg-[var(--bg-solid)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--ink))]" />
            </span>
            <div className="mb-1 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              <span>{e.date}</span>
              <span className={"rounded-full border px-2 py-0.5 " + tagStyles(e.tag)}>{e.tag}</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-[rgb(var(--ink))]">{e.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{e.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function tagStyles(t: string) {
  if (t === "New") return "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]";
  if (t === "Improved") return "border-[var(--stroke-2)] text-[var(--text-muted)]";
  return "border-[var(--stroke-1)] text-[var(--text-faint)]";
}
