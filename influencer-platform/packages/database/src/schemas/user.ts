import { z } from 'zod'

export const userRoleSchema = z.enum(['influencer', 'brand', 'admin'])
export type UserRole = z.infer<typeof userRoleSchema>

export const accountStatusSchema = z.enum(['pending', 'active', 'suspended', 'deleted'])
export type AccountStatus = z.infer<typeof accountStatusSchema>

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  username: z.string().nullable(),
  role: userRoleSchema,
  status: accountStatusSchema,
  avatar_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  phone_verified: z.boolean().default(false),
  email_verified: z.boolean().default(false),
  onboarding_completed: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type User = z.infer<typeof userSchema>

export const createUserSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type CreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = userSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type UpdateUser = z.infer<typeof updateUserSchema>