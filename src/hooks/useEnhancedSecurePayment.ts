
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCSRFProtection } from './useCSRFProtection';
import { toast } from '@/hooks/use-toast';

interface EnhancedSecurePaymentParams {
  equipmentId: string;
  equipmentTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const useEnhancedSecurePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addCSRFToHeaders, csrfToken } = useCSRFProtection();

  const validatePaymentRequest = useCallback(async (
    params: EnhancedSecurePaymentParams
  ): Promise<PaymentValidationResult> => {
    const errors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Basic validation
    if (!params.equipmentId || params.equipmentId.length < 1) {
      errors.push('Invalid equipment ID');
    }

    if (!params.equipmentTitle || params.equipmentTitle.trim().length < 1) {
      errors.push('Invalid equipment title');
    }

    if (params.totalPrice <= 0) {
      errors.push('Invalid payment amount');
    }

    // High-value transaction detection
    if (params.totalPrice > 100000) { // $1000+
      riskLevel = 'high';
    }

    // Date validation
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const now = new Date();

    if (startDate <= now) {
      errors.push('Start date must be in the future');
    }

    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }

    // Rental duration checks
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (durationDays > 365) {
      riskLevel = 'high';
      errors.push('Rental duration exceeds maximum allowed period');
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel
    };
  }, []);

  const createSecurePayment = useCallback(async (
    params: EnhancedSecurePaymentParams
  ): Promise<{ sessionId: string; url: string; bookingId: string } | null> => {
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
      // Get current user for validation
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      // Validate payment request
      const validation = await validatePaymentRequest(params);
      if (!validation.isValid) {
        toast({
          title: 'Payment Validation Failed',
          description: validation.errors.join(', '),
          variant: 'destructive',
        });
        return null;
      }

      // Backend payment operation validation
      const { data: validationResult, error: validationError } = await supabase.rpc(
        'validate_payment_operation',
        {
          p_user_id: user.id,
          p_operation: 'create_checkout',
          p_amount: params.totalPrice
        }
      );

      if (validationError || !validationResult) {
        toast({
          title: 'Payment Not Authorized',
          description: 'Payment operation could not be validated. Please contact support.',
          variant: 'destructive',
        });
        return null;
      }

      // Log payment initiation with enhanced details
      await supabase.rpc('log_payment_action', {
        p_user_id: user.id,
        p_booking_id: null,
        p_action: 'payment_initiated',
        p_amount: params.totalPrice,
        p_payment_method: 'stripe',
        p_metadata: {
          equipment_id: params.equipmentId,
          equipment_title: params.equipmentTitle,
          risk_level: validation.riskLevel,
          validation_passed: true
        }
      });

      // Create payment session with enhanced security headers
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-checkout', {
        body: {
          ...params,
          securityValidation: {
            riskLevel: validation.riskLevel,
            userId: user.id
          }
        },
        headers: {
          ...addCSRFToHeaders(),
          'X-Request-Source': 'enhanced-secure-payment',
          'X-User-ID': user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Log successful payment session creation
      await supabase.rpc('log_payment_action', {
        p_user_id: user.id,
        p_booking_id: data.bookingId,
        p_action: 'payment_session_created',
        p_amount: params.totalPrice,
        p_payment_method: 'stripe',
        p_stripe_session_id: data.sessionId,
        p_metadata: {
          checkout_url_created: true,
          risk_level: validation.riskLevel
        }
      });

      return {
        sessionId: data.sessionId,
        url: data.url,
        bookingId: data.bookingId
      };

    } catch (error) {
      console.error('Enhanced secure payment creation failed:', error);
      
      // Log failed payment attempt with enhanced details
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_payment_action', {
          p_user_id: user.id,
          p_booking_id: null,
          p_action: 'payment_failed',
          p_amount: params.totalPrice,
          p_payment_method: 'stripe',
          p_metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            enhanced_security: true
          }
        });
      }

      toast({
        title: 'Payment Creation Failed',
        description: 'Unable to create secure payment session. Please try again.',
        variant: 'destructive',
      });
      return null;

    } finally {
      setIsProcessing(false);
    }
  }, [csrfToken, addCSRFToHeaders, validatePaymentRequest]);

  return {
    createSecurePayment,
    validatePaymentRequest,
    isProcessing
  };
};
