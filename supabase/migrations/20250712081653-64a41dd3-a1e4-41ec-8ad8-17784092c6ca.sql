-- Create rate limiting table for database-based rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for efficient cleanup and querying
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_time 
ON public.rate_limit_log (identifier, created_at);

-- Enable RLS (only system can access)
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- No public access to rate limit logs
CREATE POLICY "No public access to rate limits" ON public.rate_limit_log
FOR ALL USING (false);