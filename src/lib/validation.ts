// Input Validation Utility
import { z } from 'zod';

// Common validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format').optional(),
  courseId: z.string().min(1, 'Course is required')
});

export const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  whatsapp: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid WhatsApp number format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isActive: z.boolean(),
  priority: z.number().min(1).max(5),
  targetRole: z.enum(['teacher', 'admin', 'all'])
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// API Response helper
export function createApiResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function createErrorResponse(message: string, status: number = 400) {
  return createApiResponse({ error: message }, status);
}
