import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const siteCreateSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().min(1, 'Site name is required'),
});

export const widgetConfigSchema = z.object({
  position: z.enum(['bottom-right', 'bottom-left']),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  greeting_message: z.string().min(1, 'Greeting message is required'),
  supported_languages: z.array(z.string()).min(1, 'Select at least one language'),
  voice_enabled: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type SiteCreateFormData = z.infer<typeof siteCreateSchema>;
export type WidgetConfigFormData = z.infer<typeof widgetConfigSchema>;
