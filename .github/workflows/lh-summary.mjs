#!/usr/bin/env node
/**
 * Parse the Lighthouse CI JSON output and emit a compact GitHub
 * Actions summary + a `body` output the PR-comment step consumes.
 *
 * LHCI writes one `lhr-<timestamp>.json` per run into `.lighthouseci/`.
 * We average the runs so a single noisy run doesn't dominate the comment.
 */
import { readdirSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const DIR = ".lighthouseci";
const files = (() => {
  try {
    return readdirSync(DIR).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"));
  } catch {
    return [];
  }
})();

function setOutput(key, value) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) {
    console.log(`${key}=${value}`);
    return;
  }
  // Multi-line safe delimiter form.
  appendFileSync(out, `${key}<<__EOF__\n${value}\n__EOF__\n`);
}

if (files.length === 0) {
  console.log("No Lighthouse reports found.");
  setOutput("body", "");
  process.exit(0);
}

const metrics = { lcp: [], cls: [], fcp: [], tbt: [], tti: [], perf: [] };
let url = "";
for (const f of files) {
  const lhr = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  url = lhr.finalDisplayedUrl || lhr.finalUrl || url;
  const a = lhr.audits ?? {};
  metrics.lcp.push(a["largest-contentful-paint"]?.numericValue ?? NaN);
  metrics.cls.push(a["cumulative-layout-shift"]?.numericValue ?? NaN);
  metrics.fcp.push(a["first-contentful-paint"]?.numericValue ?? NaN);
  metrics.tbt.push(a["total-blocking-time"]?.numericValue ?? NaN);
  metrics.tti.push(a["interactive"]?.numericValue ?? NaN);
  metrics.perf.push((lhr.categories?.performance?.score ?? 0) * 100);
}

const avg = (arr) => {
  const clean = arr.filter((n) => Number.isFinite(n));
  return clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : NaN;
};
const fmtMs = (n) => (Number.isFinite(n) ? `${Math.round(n)} ms` : "n/a");
const fmtCls = (n) => (Number.isFinite(n) ? n.toFixed(3) : "n/a");
const fmtScore = (n) => (Number.isFinite(n) ? Math.round(n).toString() : "n/a");

// "Good" thresholds per web.dev CWV guidance.
const lcp = avg(metrics.lcp);
const cls = avg(metrics.cls);
const lcpBadge = !Number.isFinite(lcp) ? "❔" : lcp <= 2500 ? "✅" : lcp <= 4000 ? "⚠️" : "❌";
const clsBadge = !Number.isFinite(cls) ? "❔" : cls <= 0.1 ? "✅" : cls <= 0.25 ? "⚠️" : "❌";

const body = [
  `### 🔦 Lighthouse — performance budget`,
  ``,
  url ? `URL: \`${url}\` · runs: ${files.length}` : `runs: ${files.length}`,
  ``,
  `| Metric | Value | Budget |`,
  `| --- | --- | --- |`,
  `| ${lcpBadge} LCP | **${fmtMs(lcp)}** | ≤ 2500 ms |`,
  `| ${clsBadge} CLS | **${fmtCls(cls)}** | ≤ 0.1 |`,
  `| FCP | ${fmtMs(avg(metrics.fcp))} | ≤ 1800 ms |`,
  `| TBT | ${fmtMs(avg(metrics.tbt))} | ≤ 300 ms |`,
  `| TTI | ${fmtMs(avg(metrics.tti))} | ≤ 3500 ms |`,
  `| Performance score | ${fmtScore(avg(metrics.perf))}/100 | ≥ 85 |`,
  ``,
  `Full HTML/JSON reports are attached to this run as the \`lighthouse-reports-*\` artifact.`,
].join("\n");

console.log(body);
setOutput("body", body);

// Also drop into the step summary panel.
const stepSummary = process.env.GITHUB_STEP_SUMMARY;
if (stepSummary) appendFileSync(stepSummary, body + "\n");
