
import { useCallback } from 'react';
import { toast } from 'sonner';
import { validateAndSanitize } from '@/components/security/EnhancedInputSanitization';
import { useUniversalRateLimit } from '@/components/security/UniversalRateLimit';
import { useSecureAuthSafe } from './useSecureAuthSafe';

export const useSecureFormValidation = () => {
  const { checkGeneralRateLimit } = useUniversalRateLimit();
  const { logSecurityEvent } = useSecureAuthSafe();

  const validateSecureForm = useCallback(async (
    formData: Record<string, any>,
    validationSchema: Record<string, (value: any) => any>
  ): Promise<{ isValid: boolean; sanitizedData: Record<string, any>; errors: Record<string, string> }> => {
    // Rate limiting check
    const rateLimitAllowed = await checkGeneralRateLimit();
    if (!rateLimitAllowed) {
      return { isValid: false, sanitizedData: {}, errors: { general: 'Rate limit exceeded' } };
    }

    const sanitizedData: Record<string, any> = {};
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate and sanitize each field
    for (const [key, value] of Object.entries(formData)) {
      const validator = validationSchema[key];
      if (validator) {
        try {
          const result = validator(value);
          if (result.success) {
            sanitizedData[key] = result.data;
          } else {
            errors[key] = result.error.errors[0]?.message || 'Invalid input';
            isValid = false;
          }
        } catch (error) {
          errors[key] = 'Validation error';
          isValid = false;
          
          // Log suspicious validation attempts
          await logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: Date.now(),
            details: `Form validation error for field ${key}: ${error}`
          });
        }
      } else {
        // No validator defined, basic sanitization
        sanitizedData[key] = typeof value === 'string' ? 
          value.trim().substring(0, 1000) : value;
      }
    }

    return { isValid, sanitizedData, errors };
  }, [checkGeneralRateLimit, logSecurityEvent]);

  const validateSecureFile = useCallback(async (
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: number = 5 * 1024 * 1024 // 5MB
  ): Promise<{ isValid: boolean; error?: string }> => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Invalid file type upload attempt: ${file.type}`
      });
      return { isValid: false, error: 'Invalid file type' };
    }

    // Check file size
    if (file.size > maxSize) {
      return { isValid: false, error: 'File too large' };
    }

    // Validate file name
    const fileNameResult = validateAndSanitize.fileName(file.name);
    if (!fileNameResult.success) {
      return { isValid: false, error: 'Invalid file name' };
    }

    // Basic header validation for images
    if (file.type.startsWith('image/')) {
      const buffer = await file.arrayBuffer();
      const view = new Uint8Array(buffer.slice(0, 16));
      
      // Check for common image signatures
      const isPNG = view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47;
      const isJPEG = view[0] === 0xFF && view[1] === 0xD8;
      const isWebP = view[8] === 0x57 && view[9] === 0x45 && view[10] === 0x42 && view[11] === 0x50;
      
      if (!isPNG && !isJPEG && !isWebP) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Suspicious file upload - header mismatch for ${file.name}`
        });
        return { isValid: false, error: 'File header validation failed' };
      }
    }

    return { isValid: true };
  }, [logSecurityEvent]);

  return {
    validateSecureForm,
    validateSecureFile,
    validateAndSanitize
  };
};
