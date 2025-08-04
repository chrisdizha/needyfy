import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useEscrowBalance() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["escrowBalance", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      
      // Get escrow balance using the new function
      const { data, error } = await supabase
        .rpc("get_provider_escrow_balance", {
          provider_user_id: userId
        });

      if (error) throw new Error(error.message);
      return data[0] || { total_held: 0, pending_releases: 0, available_for_payout: 0 };
    },
  });

  return query;
}

export function useEscrowReleases() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["escrowReleases", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("escrow_releases")
        .select(`
          *,
          bookings (
            equipment_title,
            start_date,
            end_date,
            owner_id
          )
        `)
        .eq("bookings.owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  return query;
}