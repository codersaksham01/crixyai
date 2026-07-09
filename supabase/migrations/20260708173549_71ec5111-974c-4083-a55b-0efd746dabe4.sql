CREATE OR REPLACE FUNCTION public.increment_referral_count(_referral_code text)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.waitlist_entries
     SET referral_count = referral_count + 1
   WHERE referral_code = _referral_code
  RETURNING referral_count;
$$;

GRANT EXECUTE ON FUNCTION public.increment_referral_count(text) TO anon, authenticated, service_role;