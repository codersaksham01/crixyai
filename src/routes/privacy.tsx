import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Shield } from "lucide-react";

const TITLE = "Privacy Policy — Crixy AI";
const DESC =
  "How Crixy AI collects, uses, stores, and protects your information. Waitlist details, data retention, and your rights.";
const URL_HERE = "https://usecrixy.com/privacy";

const LAST_UPDATED = "8 July 2026";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_HERE },
      { property: "og:type", content: "article" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL_HERE }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-solid)] text-[rgb(var(--ink))]">
      <header className="border-b border-[var(--stroke-1)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition hover:text-[rgb(var(--ink))]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Crixy
          </Link>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
            <Shield className="h-3.5 w-3.5" aria-hidden /> Privacy
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-faint)]">
          Legal · Effective {LAST_UPDATED}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)]">
          This page is maintained by Crixy AI to explain, in plain language, what we collect
          about you, why we collect it, how long we keep it, and the rights you have.
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[var(--text-muted)]">
          <Section title="Who we are">
            <p>
              Crixy AI ("Crixy", "we", "us") operates{" "}
              <a href="https://usecrixy.com" className="underline decoration-[rgb(var(--ink)/0.4)] underline-offset-4 hover:text-[rgb(var(--ink))]">
                usecrixy.com
              </a>{" "}
              and the associated waitlist and product. If you have any privacy question, reach
              us at <Mailto />.
            </p>
          </Section>

          <Section title="What we collect from the waitlist">
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Your <strong className="text-[rgb(var(--ink))]">name</strong>, so we can address you properly.</li>
              <li>Your <strong className="text-[rgb(var(--ink))]">email address</strong>, so we can send your invite.</li>
              <li>Your <strong className="text-[rgb(var(--ink))]">mobile number</strong>, so onboarding can reach you when access opens.</li>
              <li>Your stated <strong className="text-[rgb(var(--ink))]">purpose of use</strong>, so we prioritise the right industries first.</li>
              <li>The <strong className="text-[rgb(var(--ink))]">source</strong> of your signup (which button or page you came from), for internal analytics.</li>
              <li>A <strong className="text-[rgb(var(--ink))]">referral code</strong>, if you were invited by another waitlist member — so we can credit their referral.</li>
              <li>A <strong className="text-[rgb(var(--ink))]">hashed IP address</strong> for anti-abuse rate limiting only. We never store the raw IP.</li>
            </ul>
            <p className="mt-3">
              We do not ask for anything else at signup. We do not buy personal data from third parties.
            </p>
          </Section>

          <Section title="How we use your information">
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Send you invites, onboarding help, and important product notices.</li>
              <li>Occasional updates about the beta — you can opt out at any time by replying "unsubscribe" to any email.</li>
              <li>Improve the product: aggregate, non-identifying analytics on how the waitlist grows and which industries are joining.</li>
              <li>Prevent abuse — the hashed IP address is used only to rate-limit submissions from the same network.</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-[rgb(var(--ink))]">not</strong> sell your data. We do
              <strong className="text-[rgb(var(--ink))]"> not</strong> use it to train shared AI
              models. We do <strong className="text-[rgb(var(--ink))]">not</strong> share it
              with advertisers.
            </p>
          </Section>

          <Section title="Where your data lives">
            <p>
              Waitlist data is stored on managed Postgres infrastructure with encryption at rest
              and TLS in transit. Access is restricted to a small operations team with strict
              server-side controls — no browser code can read the waitlist table directly.
            </p>
          </Section>

          <Section title="Sub-processors we rely on">
            <p>
              We use a small set of trusted services to operate Crixy. Each processes only what
              is strictly necessary for its role.
            </p>
            <ul className="mt-2 ml-4 list-disc space-y-1.5">
              <li><strong className="text-[rgb(var(--ink))]">Lovable / Supabase</strong> — application hosting, database, and auth.</li>
              <li><strong className="text-[rgb(var(--ink))]">Google & OpenAI (via Lovable AI Gateway)</strong> — language and speech models used for the interactive voice demo. Inputs are used only to generate the immediate response and are not retained for training.</li>
            </ul>
          </Section>

          <Section title="How long we keep your data">
            <p>
              Waitlist entries are retained until Crixy publicly launches or you ask us to
              delete them, whichever comes first. Rate-limit records are automatically purged
              hourly.
            </p>
          </Section>

          <Section title="Your rights">
            <p>You can, at any time, ask us to:</p>
            <ul className="mt-2 ml-4 list-disc space-y-1.5">
              <li>Confirm what data we hold about you.</li>
              <li>Correct or update any inaccurate information.</li>
              <li>Delete your record entirely — we honour deletion requests within 30 days.</li>
              <li>Opt out of any non-essential email.</li>
            </ul>
            <p className="mt-3">
              Email <Mailto /> from the address you signed up with, and we'll action it.
            </p>
          </Section>

          <Section title="Cookies & analytics">
            <p>
              We currently use only strictly-necessary browser storage (to remember your
              dismissed announcements and draft form entries so you don't lose them). We do not
              set advertising or cross-site tracking cookies.
            </p>
          </Section>

          <Section title="Children">
            <p>
              Crixy AI is a B2B product intended for people 16 years and older. We do not
              knowingly collect data from children under 16.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we make a material change we will update the effective date above and, where
              appropriate, notify waitlist members by email.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For any question about your data or this policy, email <Mailto />. We aim to reply
              within two working days.
            </p>
          </Section>
        </div>

        <div className="mt-16 border-t border-[var(--stroke-1)] pt-8 text-[13px] text-[var(--text-faint)]">
          Last updated {LAST_UPDATED}.
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[22px] font-semibold tracking-tight text-[rgb(var(--ink))]">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Mailto() {
  return (
    <a
      href="mailto:privacy@usecrixy.com"
      className="inline-flex items-center gap-1 underline decoration-[rgb(var(--ink)/0.4)] underline-offset-4 hover:text-[rgb(var(--ink))]"
    >
      <Mail className="h-3.5 w-3.5" aria-hidden />
      privacy@usecrixy.com
    </a>
  );
}
