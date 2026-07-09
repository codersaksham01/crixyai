#!/usr/bin/env bun
/**
 * Concurrency load test for the atomic referral counter.
 *
 * Fires N parallel `increment_referral_count` RPC calls against a seeded
 * referrer row and verifies:
 *   1. Atomicity — final `referral_count` equals N (no lost updates).
 *   2. Latency  — reports p50 / p95 / p99 / max per call.
 *
 * The RPC is the exact code path `joinWaitlist` uses for referred signups,
 * so this exercises the increment_referral_count hot path without inflating
 * rate-limit buckets or writing throwaway waitlist entries.
 *
 * Env required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   bun run scripts/load-test-referral.ts               # default N=200
 *   N=500 bun run scripts/load-test-referral.ts
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const N = Number(process.env.N ?? 200);
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function code() {
  return randomBytes(6).toString("hex").toUpperCase().slice(0, 8) + "LT";
}

async function main() {
  const referralCode = code();
  const email = `loadtest+${referralCode.toLowerCase()}@example.invalid`;

  console.log(`[load-test] seeding referrer ${referralCode}`);
  const { data: seed, error: seedErr } = await admin
    .from("waitlist_entries")
    .insert({
      name: "load test",
      email,
      mobile: "+10000000000",
      purpose: "load-test",
      source: "load-test",
      referral_code: referralCode,
    })
    .select("id")
    .single();
  if (seedErr || !seed) {
    console.error("seed failed:", seedErr);
    process.exit(1);
  }

  console.log(`[load-test] firing ${N} parallel increment_referral_count calls`);
  const t0 = performance.now();
  const results = await Promise.allSettled(
    Array.from({ length: N }, async () => {
      const start = performance.now();
      const { error } = await admin.rpc("increment_referral_count", {
        _referral_code: referralCode,
      });
      const ms = performance.now() - start;
      if (error) throw new Error(`${error.code ?? "?"}: ${error.message}`);
      return ms;
    }),
  );
  const wallMs = performance.now() - t0;

  const latencies = results
    .filter((r): r is PromiseFulfilledResult<number> => r.status === "fulfilled")
    .map((r) => r.value)
    .sort((a, b) => a - b);
  const failures = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  const pct = (p: number) =>
    latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))]! : NaN;

  const { data: finalRow, error: readErr } = await admin
    .from("waitlist_entries")
    .select("referral_count")
    .eq("id", seed.id)
    .single();
  if (readErr) {
    console.error("read-back failed:", readErr);
  }
  const finalCount = finalRow?.referral_count ?? -1;

  // Cleanup so repeated runs don't pollute the table.
  await admin.from("waitlist_entries").delete().eq("id", seed.id);

  const okCount = latencies.length;
  const atomic = finalCount === okCount;

  console.log("\n── Results ─────────────────────────────────────────");
  console.log(`concurrency        : ${N}`);
  console.log(`ok / failed        : ${okCount} / ${failures.length}`);
  console.log(`wall time          : ${wallMs.toFixed(1)} ms`);
  console.log(`throughput         : ${((okCount / wallMs) * 1000).toFixed(1)} rpc/s`);
  console.log(`latency p50 / p95  : ${pct(0.5).toFixed(1)} / ${pct(0.95).toFixed(1)} ms`);
  console.log(`latency p99 / max  : ${pct(0.99).toFixed(1)} / ${latencies.at(-1)?.toFixed(1) ?? "n/a"} ms`);
  console.log(`final referral_count: ${finalCount} (expected ${okCount})`);
  console.log(`atomic             : ${atomic ? "✅ PASS" : "❌ FAIL — lost updates detected"}`);
  if (failures.length) {
    console.log("\nsample failures:");
    for (const f of failures.slice(0, 3)) console.log(`  - ${(f.reason as Error).message}`);
  }
  console.log("────────────────────────────────────────────────────");

  process.exit(atomic && failures.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
