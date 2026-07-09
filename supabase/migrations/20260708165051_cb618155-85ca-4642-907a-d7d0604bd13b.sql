
-- Waitlist entries: privacy-first, server-only writes/reads
CREATE TABLE public.waitlist_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL,
  purpose TEXT NOT NULL,
  source TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referrer_code TEXT,
  position INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  referral_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_waitlist_referrer_code ON public.waitlist_entries(referrer_code);
CREATE INDEX idx_waitlist_referral_code ON public.waitlist_entries(referral_code);

GRANT ALL ON public.waitlist_entries TO service_role;
-- Deliberately NO grants to anon/authenticated: only the server-side admin client (via server functions) touches this table.

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
-- No policies = locked to everyone except service_role. The server function uses supabaseAdmin, which bypasses RLS.

-- Rate limiting: one row per IP per hour bucket
CREATE TABLE public.waitlist_rate_limits (
  ip_hash TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', now()),
  attempts INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip_hash, window_start)
);

GRANT ALL ON public.waitlist_rate_limits TO service_role;
ALTER TABLE public.waitlist_rate_limits ENABLE ROW LEVEL SECURITY;
-- Locked to service_role only.
