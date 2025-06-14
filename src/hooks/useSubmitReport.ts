
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ReportType } from "@/types/reports";

export function useSubmitReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReport(props: {
    reported_user_id?: string;
    reported_listing_id?: string;
    type: ReportType;
    details: string;
  }) {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          reported_user_id: props.reported_user_id ?? null,
          reported_listing_id: props.reported_listing_id ?? null,
          type: props.type,
          details: props.details,
        },
      ])
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return null;
    }
    return data;
  }

  return { submitReport, loading, error };
}
