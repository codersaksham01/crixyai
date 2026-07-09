import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled cleanup for the waitlist rate-limit table.
 *
 * Point an external scheduler (Cloudflare cron trigger, GitHub Actions
 * scheduled workflow, pg_cron via a small HTTP call, etc.) at:
 *   POST https://<host>/api/public/cron/cleanup-waitlist
 *   Authorization: Bearer $WAITLIST_CRON_SECRET
 *
 * The handler runs `cleanup_waitlist_rate_limits()` which removes rows
 * older than 24h so the table stays small even under abuse.
 */
export const Route = createFileRoute("/api/public/cron/cleanup-waitlist")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.WAITLIST_CRON_SECRET;
        if (!secret) {
          console.error("[cron.cleanup-waitlist] WAITLIST_CRON_SECRET not set");
          return new Response("Not configured", { status: 503 });
        }

        const auth = request.headers.get("authorization") ?? "";
        const provided = auth.replace(/^Bearer\s+/i, "");
        // Constant-time-ish compare: same length + char-by-char.
        if (provided.length !== secret.length) {
          return new Response("Unauthorized", { status: 401 });
        }
        let diff = 0;
        for (let i = 0; i < secret.length; i++) {
          diff |= provided.charCodeAt(i) ^ secret.charCodeAt(i);
        }
        if (diff !== 0) return new Response("Unauthorized", { status: 401 });

        const t0 = performance.now();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("cleanup_waitlist_rate_limits");
        const ms = performance.now() - t0;

        if (error) {
          console.error(
            `[cron.cleanup-waitlist] failed ms=${ms.toFixed(1)}`,
            error,
          );
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const deleted = typeof data === "number" ? data : 0;
        console.log(`[cron.cleanup-waitlist] ok deleted=${deleted} ms=${ms.toFixed(1)}`);
        return new Response(JSON.stringify({ ok: true, deleted, ms: Math.round(ms) }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
