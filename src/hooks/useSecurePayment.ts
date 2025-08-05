import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCSRFProtection } from './useCSRFProtection';
import { toast } from '@/hooks/use-toast';

interface SecurePaymentParams {
  equipmentId: string;
  equipmentTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface PaymentResult {
  sessionId: string;
  url: string;
  bookingId: string;
}

export const useSecurePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addCSRFToHeaders, csrfToken } = useCSRFProtection();

  const createSecurePayment = async (params: SecurePaymentParams): Promise<PaymentResult | null> => {
    if (!csrfToken) {
      toast({
        title: 'Security Error',
        description: 'Security token not available. Please refresh the page.',
        variant: 'destructive',
      });
      return null;
    }

    setIsProcessing(true);
    
    try {
      // Log payment initiation for security audit
      await supabase.rpc('log_payment_action', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_booking_id: null, // Will be updated after booking creation
        p_action: 'payment_initiated',
        p_amount: params.totalPrice,
        p_payment_method: 'stripe',
        p_metadata: {
          equipment_id: params.equipmentId,
          equipment_title: params.equipmentTitle
        }
      });

      const { data, error } = await supabase.functions.invoke('create-stripe-connect-checkout', {
        body: params,
        headers: addCSRFToHeaders()
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Log successful payment session creation
      await supabase.rpc('log_payment_action', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_booking_id: data.bookingId,
        p_action: 'payment_session_created',
        p_amount: params.totalPrice,
        p_payment_method: 'stripe',
        p_stripe_session_id: data.sessionId,
        p_metadata: {
          checkout_url_created: true
        }
      });

      return {
        sessionId: data.sessionId,
        url: data.url,
        bookingId: data.bookingId
      };
    } catch (error) {
      console.error('Secure payment creation failed:', error);
      
      // Log failed payment attempt
      await supabase.rpc('log_payment_action', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_booking_id: null,
        p_action: 'payment_failed',
        p_amount: params.totalPrice,
        p_payment_method: 'stripe',
        p_metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      toast({
        title: 'Payment Creation Failed',
        description: 'Unable to create secure payment session. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createSecurePayment,
    isProcessing
  };
};