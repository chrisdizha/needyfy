
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useProviderEarnings() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["providerEarnings", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      // Fetch all provider's bookings
      // Ideally, for analytics and trend, you could build aggregate SQL views or edge functions, but we'll do it inline for now
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, status, total_price, created_at"
        )
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
  });

  return query;
}
