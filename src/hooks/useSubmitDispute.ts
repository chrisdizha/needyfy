
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubmitDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitDispute(props: {
    booking_id?: string;
    against_user_id?: string;
    reason: string;
  }) {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("disputes")
      .insert([
        {
          booking_id: props.booking_id ?? null,
          against_user_id: props.against_user_id ?? null,
          reason: props.reason,
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

  return { submitDispute, loading, error };
}
