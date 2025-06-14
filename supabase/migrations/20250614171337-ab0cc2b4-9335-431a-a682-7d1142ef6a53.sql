
-- Table for user reports (e.g., reporting fraud/suspicious activity)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users ON DELETE SET NULL,
  reported_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  reported_listing_id TEXT, -- Optional, to link to a particular listing/equipment
  type TEXT NOT NULL, -- e.g., "fraud", "suspicious_activity", "scam", "other"
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, under_review, resolved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- RLS for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can see their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  USING (reporter_id = auth.uid());

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Table for disputes (e.g., mediation between parties)
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings ON DELETE SET NULL,
  opened_by UUID REFERENCES auth.users ON DELETE SET NULL,
  against_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, in_review, resolved, closed
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- RLS for disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Dispute parties can view their disputes
CREATE POLICY "Parties to a dispute can view the dispute"
  ON public.disputes
  FOR SELECT
  USING (
    opened_by = auth.uid()
    OR against_user_id = auth.uid()
  );

-- Dispute parties can create disputes
CREATE POLICY "Users can create disputes"
  ON public.disputes
  FOR INSERT
  WITH CHECK (opened_by = auth.uid());
