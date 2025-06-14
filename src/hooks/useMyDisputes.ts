
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Dispute } from "@/types/disputes";

export function useMyDisputes() {
  return useQuery({
    queryKey: ["myDisputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Dispute[];
    },
  });
}
