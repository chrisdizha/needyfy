import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreatePayPalPaymentParams {
  equipmentId: string;
  equipmentTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface PayPalPaymentResult {
  orderId: string;
  approvalUrl: string;
  bookingId: string;
}

export const usePayPalPayment = () => {
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const createPayPalPayment = async (params: CreatePayPalPaymentParams): Promise<PayPalPaymentResult | null> => {
    setIsCreatingPayment(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-payment', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create PayPal payment');
      }

      return {
        orderId: data.orderId,
        approvalUrl: data.approvalUrl,
        bookingId: data.bookingId
      };
    } catch (error) {
      console.error('Error creating PayPal payment:', error);
      toast({
        title: 'Payment Creation Failed',
        description: 'Unable to create PayPal payment. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return {
    createPayPalPayment,
    isCreatingPayment
  };
};