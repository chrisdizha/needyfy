
export type DisputeStatus = "open" | "in_review" | "resolved" | "closed";

export type Dispute = {
  id: string;
  booking_id: string | null;
  opened_by: string | null;
  against_user_id: string | null;
  reason: string;
  status: DisputeStatus;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
};
