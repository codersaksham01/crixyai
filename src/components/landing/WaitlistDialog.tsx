import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Copy, RefreshCw, Share2, Users, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Confetti } from "./Confetti";
import { joinWaitlist, getReferralStats, type JoinWaitlistResult } from "@/lib/waitlist.functions";


/* ----------------------------- Context ----------------------------- */

type Ctx = { open: (source?: string) => void; close: () => void };
const WaitlistCtx = createContext<Ctx | null>(null);

export function useWaitlist() {
  const ctx = useContext(WaitlistCtx);
  if (!ctx) throw new Error("useWaitlist must be used inside <WaitlistProvider>");
  return ctx;
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [source, setSource] = useState<string | undefined>();

  const open = useCallback((s?: string) => {
    setSource(s);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <WaitlistCtx.Provider value={{ open, close }}>
      {children}
      <WaitlistDialog isOpen={isOpen} onClose={close} source={source} />
    </WaitlistCtx.Provider>
  );
}

/* ------------------------------ Dialog ------------------------------ */

// Server function handles Zod validation, IP rate limit, referral tracking, position assignment.

type FormState = {
  name: string;
  email: string;
  mobile: string;
  purpose: string;
};

type FieldName = keyof FormState;
type Errors = Partial<Record<FieldName, string>>;

const PURPOSES = [
  "Launch a new business",
  "Replace existing tools",
  "Marketing & content",
  "Sales & outreach",
  "Customer support",
  "Just exploring",
];

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d]{6,}$/;

function validateField(name: FieldName, value: string): string | undefined {
  const v = value.trim();
  switch (name) {
    case "name":
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "Your name looks a little short.";
      return;
    case "email":
      if (!v) return "Email is required.";
      if (!EMAIL_RE.test(v)) return "Enter a valid email like you@company.com.";
      return;
    case "mobile":
      if (!v) return "Mobile number is required.";
      if (!PHONE_RE.test(v)) return "Enter a valid phone number (digits, spaces, +).";
      return;
    case "purpose":
      if (!v) return "Tell us what you'd use Crixy for.";
      return;
  }
}

function validateAll(form: FormState): Errors {
  return (Object.keys(form) as FieldName[]).reduce<Errors>((acc, k) => {
    const err = validateField(k, form[k]);
    if (err) acc[k] = err;
    return acc;
  }, {});
}

function WaitlistDialog({
  isOpen,
  onClose,
  source,
}: {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}) {
  const DRAFT_KEY = "crixy-waitlist-draft";
  const EMPTY: FormState = { name: "", email: "", mobile: "", purpose: "" };

  const loadDraft = (): FormState => {
    if (typeof window === "undefined") return EMPTY;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return EMPTY;
      const parsed = JSON.parse(raw) as Partial<FormState>;
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        email: typeof parsed.email === "string" ? parsed.email : "",
        mobile: typeof parsed.mobile === "string" ? parsed.mobile : "",
        purpose: typeof parsed.purpose === "string" ? parsed.purpose : "",
      };
    } catch {
      return EMPTY;
    }
  };

  const [form, setForm] = useState<FormState>(loadDraft);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<JoinWaitlistResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("");
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const submitFn = useServerFn(joinWaitlist);
  const statsFn = useServerFn(getReferralStats);

  // Live stats — polled every 5s while the success screen is open so numbers
  // (position, total waitlist, own referral count) refresh smoothly in real time.
  // Cached to localStorage per referral code so a reopen of the success screen
  // (or a returning visitor with a fresh session) shows the last-known numbers
  // instantly instead of a skeleton, before the first network round-trip.
  type LiveStats = { position: number; totalCount: number; referralCount: number };
  const STATS_CACHE_PREFIX = "crixy-waitlist-stats:";
  const STATS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  const readCachedStats = useCallback((code: string | undefined): LiveStats | null => {
    if (!code || typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STATS_CACHE_PREFIX + code);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<LiveStats & { ts: number }>;
      if (
        typeof parsed.position !== "number" ||
        typeof parsed.totalCount !== "number" ||
        typeof parsed.referralCount !== "number" ||
        typeof parsed.ts !== "number"
      ) {
        return null;
      }
      // Drop stale cache entries so we never show numbers hours old.
      if (Date.now() - parsed.ts > STATS_CACHE_TTL_MS) return null;
      return {
        position: parsed.position,
        totalCount: parsed.totalCount,
        referralCount: parsed.referralCount,
      };
    } catch {
      return null;
    }
  }, []);

  const writeCachedStats = useCallback((code: string, stats: LiveStats) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STATS_CACHE_PREFIX + code,
        JSON.stringify({ ...stats, ts: Date.now() }),
      );
    } catch {
      // Quota / private-mode failures are non-fatal — polling still runs.
    }
  }, []);

  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  // "live" | "updating" (transient retry) | "paused" (after max retries)
  const [pollState, setPollState] = useState<"live" | "updating" | "paused">("live");
  // Bumped by the "Retry now" button OR the visibility handler to force
  // the polling effect to tear down and restart cleanly.
  const [retryNonce, setRetryNonce] = useState(0);

  // Hydrate liveStats from cache the moment we have a result so the success
  // screen renders real numbers immediately instead of skeleton placeholders.
  useEffect(() => {
    if (done && isOpen && result && liveStats === null) {
      const cached = readCachedStats(result.referralCode);
      if (cached) setLiveStats(cached);
    }
  }, [done, isOpen, result, liveStats, readCachedStats]);

  // Wake polling back up whenever the tab flips to visible. Registered as a
  // standalone effect so the listener still exists when the success screen was
  // first shown with the tab already hidden (e.g. user submitted, switched
  // tabs, came back). Without this, the polling effect below would early-exit
  // on mount and never subscribe, leaving the "paused"/"updating" state stuck.
  useEffect(() => {
    if (!done || !isOpen || !result) return;
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Force the polling effect to tear down + restart with fresh timers.
        setRetryNonce((n) => n + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [done, isOpen, result]);

  useEffect(() => {
    if (!done || !isOpen || !result) return;
    // Don't burn timers/network while the tab is hidden. The visibility
    // listener above will bump `retryNonce` when the tab returns, which
    // re-runs this effect from a clean slate.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      setPollState("updating");
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;
    let intervalId: number | null = null;
    const BASE_INTERVAL = 5000;
    const MAX_RETRIES = 5;
    let retries = 0;

    const clearTimers = () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (intervalId != null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const scheduleNext = (delay: number) => {
      timeoutId = window.setTimeout(tick, delay);
    };

    const tick = async () => {
      timeoutId = null;
      if (cancelled) return;
      try {
        const s = await statsFn({ data: { referralCode: result.referralCode } });
        if (cancelled) return;
        if (s.position == null) throw new Error("no-row");
        retries = 0;
        setPollState("live");
        const next: LiveStats = {
          position: s.position,
          totalCount: s.totalCount,
          referralCount: s.referralCount,
        };
        writeCachedStats(result.referralCode, next);
        setLiveStats((prev) => {
          if (
            !prev ||
            prev.totalCount !== next.totalCount ||
            prev.referralCount !== next.referralCount ||
            prev.position !== next.position
          ) {
            setPulseKey((k) => k + 1);
          }
          return next;
        });
      } catch {
        if (cancelled) return;
        if (retries < MAX_RETRIES) {
          retries += 1;
          setPollState("updating");
          const delay = Math.min(1000 * 2 ** (retries - 1), 16000);
          if (intervalId != null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
          scheduleNext(delay);
          return;
        }
        setPollState("paused");
        clearTimers();
      }
    };

    // Pause immediately if the tab goes hidden mid-run; the outer visibility
    // effect will restart us cleanly on return.
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        cancelled = true;
        clearTimers();
        setPollState("updating");
      }
    };
    document.addEventListener("visibilitychange", onHide);

    void tick();
    intervalId = window.setInterval(() => {
      if (timeoutId == null) void tick();
    }, BASE_INTERVAL);

    return () => {
      cancelled = true;
      clearTimers();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [done, isOpen, result, statsFn, retryNonce, writeCachedStats]);

  // Reset live-stats state whenever the dialog closes so a reopen doesn't
  // flash stale in-memory numbers. The localStorage cache is intentionally
  // kept so a subsequent reopen still hydrates instantly from disk.
  useEffect(() => {
    if (!isOpen) {
      setLiveStats(null);
      setPollState("live");
    }
  }, [isOpen]);




  // Reset transient state + re-load persisted draft whenever dialog reopens
  useEffect(() => {
    if (isOpen) {
      setDone(false);
      setSubmitError(null);
      setLiveStatus("");
      setTouched({});
      setErrors({});
      setForm(loadDraft());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Persist draft on every change (clear once empty or after success)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (done) return;
    try {
      const isEmpty = !form.name && !form.email && !form.mobile && !form.purpose;
      if (isEmpty) window.localStorage.removeItem(DRAFT_KEY);
      else window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form, done]);

  // Move focus to the success heading so AT users land on the confirmation
  useEffect(() => {
    if (done && isOpen) {
      const t = window.setTimeout(() => successHeadingRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [done, isOpen]);

  // Announce polling health changes to screen readers on the success screen.
  useEffect(() => {
    if (!done || !isOpen) return;
    if (pollState === "updating") {
      setLiveStatus("Reconnecting to live updates…");
    } else if (pollState === "paused") {
      setLiveStatus("Live updates paused after repeated network errors. Use Retry now to reconnect.");
    } else if (pollState === "live" && liveStats) {
      setLiveStatus("Live updates connected.");
    }
  }, [pollState, done, isOpen, liveStats]);


  // Esc + scroll lock (Esc ignored while submitting to avoid losing progress).
  // Also traps Tab focus inside the panel and restores focus on close.
  useEffect(() => {
    if (!isOpen) return;

    // Remember what to restore focus to.
    if (typeof document !== "undefined") {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
    }

    const getFocusables = (): HTMLElement[] => {
      const root = panelRef.current;
      if (!root) return [];
      const sel =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null,
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusables();
        if (items.length === 0) {
          e.preventDefault();
          panelRef.current?.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move initial focus into the panel.
    const focusTimer = window.setTimeout(() => {
      const items = getFocusables();
      (items[0] ?? panelRef.current)?.focus();
    }, 40);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(focusTimer);
      // Restore focus to the trigger element for accessibility.
      const el = restoreFocusRef.current;
      if (el && typeof el.focus === "function") {
        // rAF so it doesn't fight the closing animation.
        requestAnimationFrame(() => el.focus());
      }
    };
  }, [isOpen, onClose, submitting]);

  const setField = (name: FieldName, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors((e) => ({ ...e, [name]: validateField(name, value) }));
    }
  };

  const blurField = (name: FieldName) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validateField(name, form[name]) }));
  };


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = validateAll(form);
    setErrors(all);
    setTouched({ name: true, email: true, mobile: true, purpose: true });

    const firstErrorKey = (["name", "email", "mobile", "purpose"] as FieldName[])
      .find((k) => all[k]);
    if (firstErrorKey) {
      const el = document.getElementById(`wl-${firstErrorKey}`) as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      el?.focus();
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    setLiveStatus("Submitting your details…");
    try {
      // Grab referral code from ?ref=XXXXXX if present (informational only)
      let referrerCode: string | null = null;
      if (typeof window !== "undefined") {
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref && /^[a-z0-9]{6,12}$/i.test(ref)) referrerCode = ref.toUpperCase();
      }

      // Bot-trap: silently succeed without sending anything.
      if (website) {
        setDone(true);
        setResult(null);
        setForm({ name: "", email: "", mobile: "", purpose: "" });
        return;
      }

      const res = await fetch("https://formspree.io/f/meebwpog", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: (() => {
          const fd = new FormData();
          fd.append("name", form.name.trim());
          fd.append("email", form.email.trim());
          fd.append("mobile", form.mobile.trim());
          fd.append("purpose", form.purpose);
          fd.append("source", source ?? "unknown");
          if (referrerCode) fd.append("referrerCode", referrerCode);
          return fd;
        })(),
      });

      if (!res.ok) {
        let msg = "Couldn't submit your entry. Please try again.";
        try {
          const j = (await res.json()) as { error?: string; errors?: { message: string }[] };
          if (j.errors?.length) msg = j.errors.map((e) => e.message).join(", ");
          else if (j.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setResult(null);
      setDone(true);
      setLiveStatus("You're on the Crixy AI waitlist. We'll be in touch soon.");
      setForm({ name: "", email: "", mobile: "", purpose: "" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
      setLiveStatus(`Submission failed. ${message}`);
    } finally {
      setSubmitting(false);
    }
  }


  // Copyable referral URL derived from the successful submit result.
  const referralUrl =
    result && typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${result.referralCode}`
      : "";

  async function copyReferral() {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setLiveStatus("Referral link copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setSubmitError("Couldn't copy — long-press to select the link instead.");
    }
  }

  async function shareReferral() {
    if (!referralUrl) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Crixy AI early access",
          text: "I'm on the Crixy AI waitlist — grab founder pricing before it opens.",
          url: referralUrl,
        });
        return;
      } catch (err) {
        // User canceled the native share sheet — do NOT fall back to clipboard,
        // that would silently copy a link they explicitly declined to share.
        // Only genuine failures (share unsupported for this payload, permission
        // denied, etc.) should trigger the copy fallback.
        const isAbort =
          err instanceof DOMException && err.name === "AbortError";
        if (isAbort) return;
      }
    }
    void copyReferral();
  }



  return (
    <>
      <Confetti active={done && isOpen} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="waitlist-backdrop"
            className="fixed inset-0 z-[300] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop — click to close */}
            <button
              type="button"
              aria-label="Close dialog"
              tabIndex={-1}
              onClick={onClose}
              className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="waitlist-title"
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-[var(--stroke-2)] bg-[var(--bg-solid)] shadow-[0_40px_80px_-30px_rgb(0_0_0_/_0.6)] outline-none sm:max-h-[92dvh] sm:rounded-3xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* Sticky header strip holding the close button — always in view */}
              <div className="sticky top-0 z-20 flex items-center justify-end px-3 pt-3 sm:px-4 sm:pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="grid h-11 w-11 place-items-center rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)]/95 text-[var(--text-muted)] backdrop-blur transition hover:bg-[var(--surface-2)] hover:text-[rgb(var(--ink))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {/* Decorative gradient */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32"
                style={{
                  background:
                    "radial-gradient(60% 100% at 50% 0%, rgb(var(--ink)/0.10), transparent 70%)",
                }}
              />
              <span aria-hidden className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-[rgb(var(--ink)/0.35)]" />
              <span aria-hidden className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-[rgb(var(--ink)/0.35)] opacity-0" />

              <div className="relative -mt-2 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-4">

                {/* Global sr-only aria-live region — always mounted so both the
                    form and success screens can push updates (submitting,
                    polling reconnects, copy success, etc.) to AT users. */}
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                >
                  {liveStatus}
                </div>

                <AnimatePresence mode="wait">

                  {done ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="py-6 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-emerald-400/40 bg-emerald-400/10"
                      >
                        <CheckCircle2 className="h-7 w-7 text-emerald-300" aria-hidden />
                      </motion.div>
                      <h3
                        id="waitlist-title"
                        ref={successHeadingRef}
                        tabIndex={-1}
                        className="font-display text-2xl font-semibold tracking-tight text-[rgb(var(--ink))] focus:outline-none"
                      >
                        You're in.
                      </h3>
                      <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
                        Thanks for joining the Crixy AI waitlist. We've got your details and
                        will be in touch soon with founder pricing and early access.
                      </p>

                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--ink))] px-5 py-2.5 text-sm font-medium text-[rgb(var(--ink-inv))] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.4)]"
                      >
                        Back to the site
                      </button>
                    </motion.div>

                  ) : (

                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      noValidate
                      aria-busy={submitting}
                      aria-describedby={submitError ? "wl-form-error" : undefined}
                    >
                      <div className="mb-1 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[var(--text-faint)]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--ink))]" />
                        Private beta
                      </div>
                      <h3
                        id="waitlist-title"
                        className="font-display text-[26px] font-semibold leading-[1.1] tracking-tight text-[rgb(var(--ink))]"
                      >
                        Join the Crixy AI waitlist
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                        Get founder pricing, priority onboarding and a direct line
                        to the team.
                      </p>

                      {/* Honeypot — invisible to real users, tempting to bots. */}
                      <div aria-hidden className="pointer-events-none absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
                        <label>
                          Website (leave blank)
                          <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="mt-6 space-y-3">
                        <Field
                          name="name"
                          label="Full name"
                          value={form.name}
                          onChange={(v) => setField("name", v)}
                          onBlur={() => blurField("name")}
                          placeholder="Ada Lovelace"
                          autoComplete="name"
                          required
                          error={touched.name ? errors.name : undefined}
                        />
                        <Field
                          name="email"
                          label="Work email"
                          type="email"
                          value={form.email}
                          onChange={(v) => setField("email", v)}
                          onBlur={() => blurField("email")}
                          placeholder="you@company.com"
                          autoComplete="email"
                          inputMode="email"
                          required
                          error={touched.email ? errors.email : undefined}
                        />
                        <Field
                          name="mobile"
                          label="Mobile number"
                          type="tel"
                          value={form.mobile}
                          onChange={(v) => setField("mobile", v)}
                          onBlur={() => blurField("mobile")}
                          placeholder="+1 555 000 1234"
                          autoComplete="tel"
                          inputMode="tel"
                          required
                          error={touched.mobile ? errors.mobile : undefined}
                        />
                        <div>
                          <label
                            htmlFor="wl-purpose"
                            className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]"
                          >
                            Purpose of use <span aria-hidden className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="wl-purpose"
                              name="purpose"
                              value={form.purpose}
                              required
                              aria-required="true"
                              aria-invalid={touched.purpose && !!errors.purpose}
                              aria-describedby={
                                touched.purpose && errors.purpose ? "wl-purpose-error" : undefined
                              }
                              onChange={(e) => setField("purpose", e.target.value)}
                              onBlur={() => blurField("purpose")}
                              className={
                                "w-full appearance-none rounded-xl border bg-[var(--surface-1)] px-3.5 py-3 pr-9 text-sm text-[rgb(var(--ink))] transition focus:outline-none focus:ring-2 " +
                                (touched.purpose && errors.purpose
                                  ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/25"
                                  : "border-[var(--stroke-1)] focus:border-[rgb(var(--ink)/0.5)] focus:ring-[rgb(var(--ink)/0.15)]")
                              }
                            >
                              <option value="" disabled>
                                Select an option…
                              </option>
                              {PURPOSES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            <svg
                              aria-hidden
                              viewBox="0 0 20 20"
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
                            </svg>
                          </div>
                          <FieldError id="wl-purpose-error" error={touched.purpose ? errors.purpose : undefined} />
                        </div>
                      </div>

                      {/* Global submit error (network/server) */}
                      <div id="wl-form-error" aria-live="polite" role="alert" className="min-h-[0px]">
                        <AnimatePresence>
                          {submitError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300"
                            >
                              {submitError}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        aria-disabled={submitting}
                        className="group mt-6 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--ink))] px-5 py-3 text-sm font-medium text-[rgb(var(--ink-inv))] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.35)] disabled:cursor-wait disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <Spinner />
                            <span>Submitting…</span>
                          </>
                        ) : (
                          <>
                            <span>Join the waitlist</span>
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </>
                        )}
                      </button>

                      {/* Global sr-only status region — announces submitting / success / failure */}
                      <div
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        className="sr-only"
                      >
                        {liveStatus}
                      </div>

                      <p className="mt-3 text-center text-[11px] text-[var(--text-faint)]">
                        We'll never share your info. Unsubscribe anytime.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------ Field ------------------------------ */

function Field({
  name,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  required,
  error,
}: {
  name: FieldName;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "search" | "url";
  required?: boolean;
  error?: string;
}) {
  const id = `wl-${name}`;
  const errorId = `${id}-error`;
  const invalid = !!error;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-required={required || undefined}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className={
          "w-full rounded-xl border bg-[var(--surface-1)] px-3.5 py-3 text-sm text-[rgb(var(--ink))] placeholder:text-[var(--text-faint)] transition focus:outline-none focus:ring-2 " +
          (invalid
            ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/25"
            : "border-[var(--stroke-1)] focus:border-[rgb(var(--ink)/0.5)] focus:ring-[rgb(var(--ink)/0.15)]")
        }
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <div id={id} aria-live="polite" className="min-h-[16px]">
      <AnimatePresence>
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.18 }}
            className="mt-1 flex items-start gap-1 text-[11.5px] font-medium text-red-400"
          >
            <span aria-hidden className="mt-[3px] inline-block h-1 w-1 shrink-0 rounded-full bg-red-400" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
