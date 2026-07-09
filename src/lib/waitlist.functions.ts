import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";

const WaitlistInput = z.object({
  name: z.string().trim().min(2, "Name too short").max(100, "Name too long"),
  email: z.string().trim().toLowerCase().email("Invalid email").max(254),
  mobile: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{6,20}$/, "Invalid phone number"),
  purpose: z.string().trim().min(2).max(80),
  source: z.string().trim().max(60).optional().nullable(),
  referrerCode: z
    .string()
    .trim()
    .regex(/^[a-z0-9]{6,12}$/i)
    .optional()
    .nullable(),
  // Honeypot: humans leave this empty. Bots often fill every input.
  website: z.string().max(0, "Bot detected").optional().default(""),
});

type WaitlistInputRaw = z.input<typeof WaitlistInput>;

const RATE_LIMIT_MAX = 5; // 5 attempts per hour per IP

function hashIp(ip: string): string {
  // Salted to avoid trivial reverse mapping; still one-way.
  return createHash("sha256")
    .update(`crixy-waitlist::${ip}`)
    .digest("hex")
    .slice(0, 32);
}

function generateReferralCode(): string {
  // 6 alphanumeric chars, uppercase, unambiguous
  return randomBytes(8)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, "X");
}

function getClientIp(request: Request | undefined): string {
  if (!request) return "unknown";
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Seed offset so early positions/counts feel socially proofed.
// Real DB rows still grow live on top of this baseline.
const WAITLIST_BASE_OFFSET = 1247;

export type JoinWaitlistResult = {
  ok: true;
  position: number;
  referralCode: string;
  totalCount: number;
};

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => WaitlistInput.parse(raw) as WaitlistInputRaw)
  .handler(async ({ data }): Promise<JoinWaitlistResult> => {
    // Wrap the whole handler so any thrown error is logged with the same
    // `[waitlist.metrics]` prefix as the success path — easy to grep across
    // both signals in the worker logs.
    const t0 = performance.now();
    let rpcMs: number | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");




    const req = getRequest();
    const ip = getClientIp(req);
    const ipHash = hashIp(ip);

    // ---- Rate limit: 5 submissions / hour / IP ----
    // Sum attempts across ALL rate-limit rows in the last 60 minutes, not just
    // the current hour bucket. Without this, a user can submit 5 at 10:59 and
    // another 5 at 11:00 because each hour gets its own row and the current
    // bucket starts at 0.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: rlRows } = await supabaseAdmin
      .from("waitlist_rate_limits")
      .select("attempts, window_start")
      .eq("ip_hash", ipHash)
      .gte("window_start", oneHourAgo);

    const recentAttempts =
      rlRows?.reduce((sum, r) => sum + (r.attempts ?? 0), 0) ?? 0;

    if (recentAttempts >= RATE_LIMIT_MAX) {
      throw new Error("Too many submissions from this network. Try again in an hour.");
    }

    // ---- Check duplicate email early (friendlier error) ----
    const { data: existing } = await supabaseAdmin
      .from("waitlist_entries")
      .select("position, referral_code")
      .eq("email", data.email)
      .maybeSingle();

    if (existing) {
      // Return the existing spot instead of erroring — the user experience is "you're already in".
      const { count } = await supabaseAdmin
        .from("waitlist_entries")
        .select("*", { count: "exact", head: true });
      return {
        ok: true,
        position: existing.position + WAITLIST_BASE_OFFSET,
        referralCode: existing.referral_code,
        // Fallback of 0 (not `existing.position`) — using position as a total
        // would understate the true waitlist size on the rare count-query failure.
        totalCount: (count ?? 0) + WAITLIST_BASE_OFFSET,
      };
    }



    // ---- Insert entry ----
    let referralCode = generateReferralCode();
    // Retry once on the extremely rare collision.
    for (let i = 0; i < 3; i++) {
      const { data: clash } = await supabaseAdmin
        .from("waitlist_entries")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle();
      if (!clash) break;
      referralCode = generateReferralCode();
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("waitlist_entries")
      .insert({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        purpose: data.purpose,
        source: data.source ?? null,
        referral_code: referralCode,
        referrer_code: data.referrerCode ?? null,
      })
      .select("position, referral_code")
      .single();

    if (insertErr || !inserted) {
      console.error("[waitlist] insert failed", insertErr);
      throw new Error("Couldn't save your entry. Please try again.");
    }

    // ---- Bump referrer count atomically (best-effort) ----
    // Uses a SECURITY DEFINER RPC so concurrent referrals cannot clobber
    // each other via a read-modify-write race. Latency is logged so we can
    // watch for regressions after the atomic switch.
    if (data.referrerCode) {
      const rpcStart = performance.now();
      const { error: rpcErr } = await supabaseAdmin.rpc("increment_referral_count", {
        _referral_code: data.referrerCode,
      });
      rpcMs = performance.now() - rpcStart;
      if (rpcErr) {
        console.error(
          `[waitlist.metrics] increment_referral_count failed rpc_ms=${rpcMs.toFixed(1)}`,
          rpcErr,
        );
      } else {
        console.log(
          `[waitlist.metrics] increment_referral_count ok rpc_ms=${rpcMs.toFixed(1)}`,
        );
        if (rpcMs > 250) {
          console.warn(
            `[waitlist.metrics] increment_referral_count SLOW rpc_ms=${rpcMs.toFixed(1)}`,
          );
        }
      }
    }




    // ---- Bump rate limit counter (current hour bucket) ----
    // Find the attempts already logged for THIS hour bucket so we increment it
    // instead of resetting on collision. Other buckets in the last hour are
    // already accounted for in the `recentAttempts` sum above.
    const currentBucketStart = new Date(new Date().setMinutes(0, 0, 0)).toISOString();
    const currentBucketAttempts =
      rlRows?.find((r) => r.window_start === currentBucketStart)?.attempts ?? 0;
    await supabaseAdmin.from("waitlist_rate_limits").upsert(
      {
        ip_hash: ipHash,
        window_start: currentBucketStart,
        attempts: currentBucketAttempts + 1,
      },
      { onConflict: "ip_hash,window_start" },
    );


    // ---- Total count for context ----
    const { count } = await supabaseAdmin
      .from("waitlist_entries")
      .select("*", { count: "exact", head: true });

    const totalMs = performance.now() - t0;
    console.log(
      `[waitlist.metrics] joinWaitlist ok total_ms=${totalMs.toFixed(1)} rpc_ms=${
        rpcMs === null ? "n/a" : rpcMs.toFixed(1)
      } referred=${data.referrerCode ? "yes" : "no"}`,
    );

      return {
        ok: true,
        position: inserted.position + WAITLIST_BASE_OFFSET,
        referralCode: inserted.referral_code,
        totalCount: (count ?? inserted.position) + WAITLIST_BASE_OFFSET,
      };
    } catch (err) {
      const totalMs = performance.now() - t0;
      const msg = err instanceof Error ? err.message : String(err);
      // Structured error line — mirrors the [waitlist.metrics] success prefix
      // so operators can grep both signals together in worker logs.
      console.error(
        `[waitlist.metrics] joinWaitlist FAIL total_ms=${totalMs.toFixed(1)} rpc_ms=${
          rpcMs === null ? "n/a" : rpcMs.toFixed(1)
        } referred=${data.referrerCode ? "yes" : "no"} msg=${JSON.stringify(msg)}`,
      );
      throw err;
    }
  });



// Public: return an entry's live position + referral count + total waitlist size.
// Called on a poll from the success screen so numbers refresh in real time.
export const getReferralStats = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        referralCode: z.string().trim().regex(/^[A-Z0-9]{6,12}$/i),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: row }, { count }] = await Promise.all([
      supabaseAdmin
        .from("waitlist_entries")
        .select("position, referral_count")
        .eq("referral_code", data.referralCode.toUpperCase())
        .maybeSingle(),
      supabaseAdmin.from("waitlist_entries").select("*", { count: "exact", head: true }),
    ]);
    return {
      position: row ? row.position + WAITLIST_BASE_OFFSET : null,
      referralCount: row?.referral_count ?? 0,
      totalCount: (count ?? 0) + WAITLIST_BASE_OFFSET,
    };
  });
