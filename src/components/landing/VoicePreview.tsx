import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, Phone, Play, Send, Square, VolumeX } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateVoiceReply } from "@/lib/voice-preview.functions";

/**
 * Interactive voice preview.
 *
 * The visitor picks a business type, types a customer message, and hears
 * Crixy's spoken reply generated live by Lovable AI + TTS. Falls back to
 * on-screen text if audio synthesis is unavailable.
 */

type Scenario = "cafe" | "clinic" | "salon" | "studio";

const SCENARIOS: Array<{ id: Scenario; label: string; business: string; suggest: string }> = [
  { id: "cafe", label: "Cafe", business: "Northwind Coffee", suggest: "Do you have oat milk? I'd like to book a table for 4 at 7pm." },
  { id: "clinic", label: "Clinic", business: "Bright Family Dental", suggest: "Hi, I'd like to book a cleaning next week — mornings work best." },
  { id: "salon", label: "Salon", business: "Halo Studio", suggest: "How much for a men's cut and beard trim on Saturday afternoon?" },
  { id: "studio", label: "Fitness", business: "Kilometre Yoga", suggest: "What time is the Sunday morning class and is it beginner friendly?" },
];

export function VoicePreview() {
  const [scenario, setScenario] = useState<Scenario>("cafe");
  const [message, setMessage] = useState(SCENARIOS[0].suggest);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const generate = useServerFn(generateVoiceReply);

  // Waveform pulse — advances while audio plays or while we're loading.
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!playing && !loading) return;
    const id = window.setInterval(() => setPulse((p) => p + 1), 90);
    return () => window.clearInterval(id);
  }, [playing, loading]);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(
    () => () => {
      stop();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    },
    [stop],
  );

  const swapScenario = (next: Scenario) => {
    if (loading) return;
    stop();
    setScenario(next);
    setMessage(SCENARIOS.find((s) => s.id === next)!.suggest);
    setReply(null);
    setError(null);
  };

  async function submit() {
    if (loading) return;
    const trimmed = message.trim();
    if (trimmed.length < 2) {
      setError("Type a short customer message first.");
      return;
    }
    setError(null);
    setReply(null);
    stop();
    setLoading(true);
    try {
      const res = await generate({
        data: {
          scenario,
          message: trimmed,
          businessName: SCENARIOS.find((s) => s.id === scenario)!.business,
        },
      });
      setReply(res.reply);

      if (res.audioBase64) {
        // Convert base64 → Blob → object URL
        const bin = atob(res.audioBase64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const blob = new Blob([arr], { type: res.mime });

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;
        audio.src = url;
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          setPlaying(false);
          setAudioAvailable(false);
        };
        try {
          await audio.play();
          setPlaying(true);
          setAudioAvailable(true);
        } catch {
          setAudioAvailable(false);
        }
      } else {
        setAudioAvailable(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Waveform bars — reactive to pulse.
  const barCount = 30;
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }).map((_, i) => {
        const active = playing || loading;
        if (!active) return 6;
        const phase = (i + pulse) % barCount;
        const t = phase / barCount;
        const h =
          10 +
          Math.abs(Math.sin(t * Math.PI * 2 + pulse * 0.35)) * 26 +
          Math.abs(Math.sin(t * Math.PI * 5 + pulse * 0.7)) * 10;
        return Math.round(h);
      }),
    [pulse, playing, loading],
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-[var(--stroke-1)] bg-[var(--surface-1)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
          <Phone className="h-3.5 w-3.5" /> Voice AI · live demo
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]"
          aria-live="polite"
        >
          {loading ? "thinking" : playing ? "speaking" : reply ? "ready" : "idle"}
        </span>
      </div>

      {/* Scenario picker */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Business scenario">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={scenario === s.id}
            onClick={() => swapScenario(s.id)}
            disabled={loading}
            className={
              "rounded-full border px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.35)] " +
              (scenario === s.id
                ? "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[rgb(var(--ink-inv))]"
                : "border-[var(--stroke-1)] bg-[var(--bg-solid)] text-[var(--text-muted)] hover:text-[rgb(var(--ink))]")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Message input */}
      <div>
        <label htmlFor="voice-input" className="sr-only">
          Customer message
        </label>
        <div className="flex items-stretch gap-2">
          <input
            id="voice-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            maxLength={280}
            placeholder="Type what a customer might say…"
            disabled={loading}
            className="flex-1 rounded-xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] px-3.5 py-3 text-sm text-[rgb(var(--ink))] placeholder:text-[var(--text-faint)] transition focus:border-[rgb(var(--ink)/0.5)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ink)/0.15)] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            aria-label="Send message and hear Crixy reply"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--ink))] px-4 text-sm font-medium text-[rgb(var(--ink-inv))] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.35)] disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Ask Crixy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveform */}
      <div
        className="flex h-14 w-full items-end justify-center gap-[3px]"
        role="img"
        aria-label={playing ? "Crixy is speaking" : "Voice waveform, idle"}
      >
        {bars.map((h, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="w-[3px] rounded-full bg-[rgb(var(--ink))]"
            animate={{ height: h, opacity: playing || loading ? 0.9 : 0.35 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: 6 }}
          />
        ))}
      </div>

      {/* Playback controls when audio is playing */}
      {playing && (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke-2)] bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[rgb(var(--ink))] transition hover:bg-[var(--surface-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ink)/0.35)]"
          >
            <Square className="h-3.5 w-3.5 fill-current" /> Stop
          </button>
        </div>
      )}

      {/* Reply transcript */}
      <AnimatePresence mode="wait">
        {reply && (
          <motion.div
            key={reply}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-[var(--stroke-1)] bg-[var(--bg-solid)] p-4"
          >
            <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
              <Mic className="h-3 w-3" aria-hidden /> Crixy says
              {!audioAvailable && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 normal-case tracking-normal text-[10px] font-medium text-amber-300">
                  <VolumeX className="h-3 w-3" aria-hidden />
                  audio unavailable
                </span>
              )}
              {audioAvailable && !playing && (
                <button
                  type="button"
                  onClick={() => {
                    const el = audioRef.current;
                    if (!el || !el.src) return;
                    el.currentTime = 0;
                    void el
                      .play()
                      .then(() => setPlaying(true))
                      .catch(() => setAudioAvailable(false));
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--stroke-1)] bg-[var(--surface-1)] px-2.5 py-1 normal-case tracking-normal text-[11px] font-medium text-[rgb(var(--ink))] transition hover:bg-[var(--surface-2)]"
                >
                  <Play className="h-3 w-3" aria-hidden /> Replay
                </button>
              )}
            </div>
            <p className="font-serif text-[15px] italic leading-relaxed text-[rgb(var(--ink))]">
              "{reply}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300"
        >
          {error}
        </div>
      )}

      <p className="text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
        Live demo — replies generated in real time. Production Crixy uses a neural cloned voice trained on your brand.
      </p>
    </div>
  );
}
