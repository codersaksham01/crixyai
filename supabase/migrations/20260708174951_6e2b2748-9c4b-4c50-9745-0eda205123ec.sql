CREATE OR REPLACE FUNCTION public.cleanup_waitlist_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.waitlist_rate_limits
   WHERE window_start < now() - interval '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Server-only: revoke default PUBLIC execute, allow service_role only.
REVOKE EXECUTE ON FUNCTION public.cleanup_waitlist_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_waitlist_rate_limits() TO service_role;