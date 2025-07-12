
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubmitDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitDispute(props: {
    booking_id?: string;
    against_user_id: string;  // Now required due to NOT NULL constraint
    reason: string;
  }) {
    setLoading(true);
    setError(null);
    
    // Get current user ID for opened_by field
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from("disputes")
      .insert([
        {
          booking_id: props.booking_id ?? null,
          against_user_id: props.against_user_id,
          opened_by: user.id,  // Required field
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
