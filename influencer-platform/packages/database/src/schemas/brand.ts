import { z } from 'zod'

export const brandProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company_name: z.string().min(2).max(100),
  website: z.string().url().nullable(),
  industry: z.string(),
  description: z.string().max(1000).nullable(),
  logo_url: z.string().url().nullable(),
  location: z.string().nullable(),
  company_size: z.string().nullable(),
  verified: z.boolean().default(false),
  total_spent: z.number().min(0).default(0),
  completed_campaigns: z.number().int().min(0).default(0),
  stripe_customer_id: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type BrandProfile = z.infer<typeof brandProfileSchema>

export const createBrandProfileSchema = brandProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  total_spent: true,
  completed_campaigns: true,
  verified: true,
})

export type CreateBrandProfile = z.infer<typeof createBrandProfileSchema>

export const updateBrandProfileSchema = brandProfileSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type UpdateBrandProfile = z.infer<typeof updateBrandProfileSchema>