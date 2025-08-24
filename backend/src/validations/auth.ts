import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Format d\'email invalide')
    .min(1, 'Email requis'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .email('Format d\'email invalide')
    .min(1, 'Email requis'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirmation du mot de passe requise'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Le prénom ne peut contenir que des lettres et espaces'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Le nom ne peut contenir que des lettres et espaces'),
  role: z
    .enum(['user', 'admin'])
    .optional()
    .default('user'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Token de rafraîchissement requis'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Token validation schema
export const validateTokenSchema = z.object({
  token: z
    .string()
    .min(1, 'Token requis'),
});

export type ValidateTokenInput = z.infer<typeof validateTokenSchema>;

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le nouveau mot de passe ne doit pas dépasser 128 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'Confirmation du mot de passe requise'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>; 