
import { z } from 'zod';

// Enhanced input validation schemas
export const secureValidationSchemas = {
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .max(15, 'Phone number too long'),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Invalid characters in name')
    .transform(val => val.trim()),

  text: z.string()
    .max(1000, 'Text too long')
    .transform(val => sanitizeInput(val)),

  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long')
    .regex(/^https?:\/\//, 'Only HTTP/HTTPS URLs allowed'),

  number: z.number()
    .min(0, 'Number must be positive')
    .max(999999999, 'Number too large')
    .finite('Invalid number'),

  uuid: z.string()
    .uuid('Invalid UUID format'),

  json: z.any()
    .refine(val => {
      try {
        JSON.stringify(val);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid JSON data')
};

// Enhanced XSS protection
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\(/gi, '')
    .trim();
};

// SQL injection protection
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/['"\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/;/g, '')
    .replace(/\b(DROP|DELETE|UPDATE|INSERT|SELECT|UNION|ALTER|CREATE)\b/gi, '')
    .trim();
};

// Enhanced form validation hook
export const useSecureValidation = () => {
  const validateField = (value: any, schema: z.ZodSchema) => {
    try {
      const result = schema.safeParse(value);
      return {
        isValid: result.success,
        error: result.success ? null : result.error.errors[0]?.message,
        sanitizedValue: result.success ? result.data : value
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Validation error',
        sanitizedValue: value
      };
    }
  };

  const validateForm = (data: Record<string, any>, schema: z.ZodSchema) => {
    try {
      const result = schema.safeParse(data);
      return {
        isValid: result.success,
        errors: result.success ? {} : result.error.flatten().fieldErrors,
        sanitizedData: result.success ? result.data : data
      };
    } catch (error) {
      return {
        isValid: false,
        errors: { _form: ['Form validation error'] },
        sanitizedData: data
      };
    }
  };

  return { validateField, validateForm };
};

// CSRF protection utility
export const generateCSRFToken = (): string => {
  return btoa(Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
};

export const validateCSRFToken = (token: string): boolean => {
  try {
    const decoded = atob(token);
    const timestamp = parseInt(decoded.split('').slice(-13).join(''), 36);
    const now = Date.now();
    return now - timestamp < 3600000; // 1 hour validity
  } catch {
    return false;
  }
};
