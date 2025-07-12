import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ConditionVerificationForm {
  id: string;
  booking_id: string;
  equipment_id: string;
  equipment_title: string | null;
  created_at: string;
  handover_type: 'pickup' | 'return';
  condition_rating: number;
  condition_notes: string | null;
  damages_reported: string[] | null;
  photos: string[] | null;
  renter_signature: string | null;
  renter_name: string;
  renter_signed_at: string | null;
  provider_signature: string | null;
  provider_name: string | null;
  provider_signed_at: string | null;
  completed: boolean;
}

export const useConditionVerificationForms = (bookingId?: string) => {
  const [forms, setForms] = useState<ConditionVerificationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchForms = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('condition_verification_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setForms((data || []) as ConditionVerificationForm[]);
    } catch (error) {
      console.error('Error fetching condition verification forms:', error);
      toast({
        title: "Error loading forms",
        description: "Could not load condition verification forms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormPhotoUrl = async (photoPath: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('condition-photos')
      .getPublicUrl(photoPath);
    
    return data.publicUrl;
  };

  const updateFormSignature = async (
    formId: string, 
    signatureData: string, 
    signerName: string,
    signerType: 'renter' | 'provider'
  ) => {
    try {
      const updateData: any = {};
      
      if (signerType === 'renter') {
        updateData.renter_signature = signatureData;
        updateData.renter_signed_at = new Date().toISOString();
        updateData.renter_name = signerName;
      } else {
        updateData.provider_signature = signatureData;
        updateData.provider_signed_at = new Date().toISOString();
        updateData.provider_name = signerName;
      }

      const { error } = await supabase
        .from('condition_verification_forms')
        .update(updateData)
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: "Signature added",
        description: `${signerType} signature has been saved`
      });

      await fetchForms(); // Refresh the forms
    } catch (error) {
      console.error('Error updating signature:', error);
      toast({
        title: "Error saving signature",
        description: "Could not save the signature. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markFormComplete = async (formId: string) => {
    try {
      const { error } = await supabase
        .from('condition_verification_forms')
        .update({ completed: true })
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: "Form completed",
        description: "Condition verification form has been marked as complete"
      });

      await fetchForms(); // Refresh the forms
    } catch (error) {
      console.error('Error marking form complete:', error);
      toast({
        title: "Error updating form",
        description: "Could not mark form as complete. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchForms();
  }, [bookingId]);

  return {
    forms,
    loading,
    refetch: fetchForms,
    getFormPhotoUrl,
    updateFormSignature,
    markFormComplete
  };
};