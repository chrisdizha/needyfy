
export type ReportType = "fraud" | "suspicious_activity" | "scam" | "other";
export type ReportStatus = "open" | "under_review" | "resolved" | "rejected";

export type Report = {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  reported_listing_id: string | null;
  type: ReportType;
  details: string;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
};
