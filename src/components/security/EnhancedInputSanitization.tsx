
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Enhanced input sanitization with comprehensive XSS protection
export class InputSanitizer {
  private static instance: InputSanitizer;
  
  private constructor() {}
  
  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  // Sanitize HTML content with strict policy
  sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      FORCE_BODY: true
    });
  }

  // Sanitize for database insertion
  sanitizeForDatabase(input: string): string {
    return input
      .replace(/[<>'"&]/g, (char) => {
        const map: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return map[char] || char;
      })
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }

  // Sanitize file names
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255);
  }

  // Validate and sanitize email
  sanitizeEmail(email: string): string {
    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
  }

  // Validate and sanitize phone number
  sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+()-\s]/g, '').trim();
  }

  // Remove potentially dangerous characters for search queries
  sanitizeSearchQuery(query: string): string {
    return query
      .replace(/['"\\;]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }
}

// Enhanced validation schemas with sanitization
export const enhancedValidationSchemas = {
  email: z.string()
    .min(1, { message: 'Email is required' })
    .transform((val) => InputSanitizer.getInstance().sanitizeEmail(val))
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email format'
    }),
    
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[!@#$%^&*]/, { message: 'Password must contain at least one special character' }),
    
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' })
    .transform((val) => InputSanitizer.getInstance().sanitizeHtml(val)),
    
  text: z.string()
    .max(1000, { message: 'Text must be less than 1000 characters' })
    .transform((val) => InputSanitizer.getInstance().sanitizeHtml(val)),
    
  phone: z.string()
    .regex(/^[\d+()-\s]*$/, { message: 'Invalid phone number format' })
    .transform((val) => InputSanitizer.getInstance().sanitizePhone(val))
    .optional(),
    
  url: z.string()
    .url({ message: 'Invalid URL format' })
    .refine((val) => /^https?:\/\//.test(val), {
      message: 'URL must use HTTP or HTTPS protocol'
    }),
    
  fileName: z.string()
    .min(1, { message: 'File name is required' })
    .max(255, { message: 'File name too long' })
    .transform((val) => InputSanitizer.getInstance().sanitizeFileName(val)),
    
  searchQuery: z.string()
    .min(1, { message: 'Search query is required' })
    .max(100, { message: 'Search query too long' })
    .transform((val) => InputSanitizer.getInstance().sanitizeSearchQuery(val)),
    
  price: z.number()
    .positive({ message: 'Price must be positive' })
    .max(1000000, { message: 'Price too high' }),
    
  description: z.string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(2000, { message: 'Description must be less than 2000 characters' })
    .transform((val) => InputSanitizer.getInstance().sanitizeForDatabase(val))
};

// Validation helper functions
export const validateAndSanitize = {
  email: (value: string) => enhancedValidationSchemas.email.safeParse(value),
  password: (value: string) => enhancedValidationSchemas.password.safeParse(value),
  name: (value: string) => enhancedValidationSchemas.name.safeParse(value),
  text: (value: string) => enhancedValidationSchemas.text.safeParse(value),
  phone: (value: string) => enhancedValidationSchemas.phone.safeParse(value),
  url: (value: string) => enhancedValidationSchemas.url.safeParse(value),
  fileName: (value: string) => enhancedValidationSchemas.fileName.safeParse(value),
  searchQuery: (value: string) => enhancedValidationSchemas.searchQuery.safeParse(value),
  price: (value: number) => enhancedValidationSchemas.price.safeParse(value),
  description: (value: string) => enhancedValidationSchemas.description.safeParse(value)
};
