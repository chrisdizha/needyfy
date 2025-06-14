
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch, upload, and delete documents for a given equipment
 */
export function useEquipmentDocuments(equipmentId: string) {
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: docs, isLoading, error } = useQuery({
    queryKey: ["equipmentDocuments", equipmentId],
    queryFn: async () => {
      if (!equipmentId) return [];
      const { data, error } = await supabase
        .from("equipment_documents")
        .select("*")
        .eq("equipment_id", equipmentId)
        .order("date_uploaded", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!equipmentId,
  });

  // Upload document
  const uploadDoc = useMutation({
    mutationFn: async (params: {
      file: File;
      docType: string;
      expiryDate?: string;
    }) => {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) throw new Error("Not logged in.");

      // Upload to storage
      const fileExt = params.file.name.split('.').pop();
      const fileName = `${equipmentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from("equipment-documents")
        .upload(fileName, params.file, { upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      // Insert to equipment_documents table
      const { error: dbError } = await supabase.from("equipment_documents").insert({
        equipment_id: equipmentId,
        file_path: fileName,
        doc_type: params.docType,
        expiry_date: params.expiryDate ?? null,
        file_name: params.file.name,
        uploaded_by: userId,
      });
      if (dbError) throw new Error(dbError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipmentDocuments", equipmentId] });
    },
  });

  // Delete document
  const deleteDoc = useMutation({
    mutationFn: async (doc: any) => {
      // First, delete from storage
      await supabase.storage.from("equipment-documents").remove([doc.file_path]);
      // Then, delete row from db
      const { error } = await supabase
        .from("equipment_documents")
        .delete()
        .eq("id", doc.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipmentDocuments", equipmentId] });
    },
  });

  // Get download URL (private)
  const getDownloadUrl = async (filePath: string) => {
    const { data, error } = await supabase
      .storage
      .from("equipment-documents")
      .createSignedUrl(filePath, 60 * 10); // 10 min
    if (error) throw new Error(error.message);
    return data.signedUrl;
  };

  return {
    docs, isLoading, error,
    uploadDoc,
    deleteDoc,
    getDownloadUrl,
  };
}
