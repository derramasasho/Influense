import { z } from 'zod'

export const campaignStatusSchema = z.enum(['draft', 'active', 'paused', 'completed', 'cancelled'])
export type CampaignStatus = z.infer<typeof campaignStatusSchema>

export const platformSchema = z.enum([
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'linkedin',
])
export type Platform = z.infer<typeof platformSchema>

export const deliverableTypeSchema = z.enum([
  'post',
  'story',
  'reel',
  'video',
  'live',
  'blog',
  'other',
])
export type DeliverableType = z.infer<typeof deliverableTypeSchema>

export const deliverableSchema = z.object({
  type: deliverableTypeSchema,
  platform: platformSchema,
  quantity: z.number().int().min(1),
  description: z.string().optional(),
})
export type Deliverable = z.infer<typeof deliverableSchema>

export const campaignSchema = z.object({
  id: z.string().uuid(),
  brand_id: z.string().uuid(),
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(2000),
  objectives: z.array(z.string()).min(1).max(5),
  requirements: z.array(z.string()).min(1).max(10),
  deliverables: z.array(deliverableSchema).min(1),
  budget_min: z.number().min(50),
  budget_max: z.number().min(50),
  currency: z.string().default('BGN'),
  categories: z.array(z.string()).min(1).max(5),
  platforms: z.array(platformSchema).min(1),
  location_requirements: z.array(z.string()).optional(),
  language_requirements: z.array(z.string()).optional(),
  min_followers: z.number().int().min(0).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  application_deadline: z.string().datetime().optional(),
  status: campaignStatusSchema,
  visibility: z.enum(['public', 'private']).default('public'),
  total_applications: z.number().int().default(0),
  selected_influencers: z.number().int().default(0),
  view_count: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Campaign = z.infer<typeof campaignSchema>

export const createCampaignSchema = campaignSchema.omit({
  id: true,
  brand_id: true,
  created_at: true,
  updated_at: true,
  total_applications: true,
  selected_influencers: true,
  view_count: true,
}).refine(data => data.budget_max >= data.budget_min, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budget_max'],
})
export type CreateCampaign = z.infer<typeof createCampaignSchema>

export const updateCampaignSchema = campaignSchema.partial().omit({
  id: true,
  brand_id: true,
  created_at: true,
  updated_at: true,
})
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>

// Application schemas
export const applicationStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'withdrawn'])
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>

export const campaignApplicationSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  proposal_text: z.string().min(50).max(1000),
  proposed_budget: z.number().min(0),
  proposed_deliverables: z.array(deliverableSchema),
  portfolio_links: z.array(z.string().url()).max(5).optional(),
  status: applicationStatusSchema,
  brand_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
  applied_at: z.string().datetime(),
  reviewed_at: z.string().datetime().optional(),
})
export type CampaignApplication = z.infer<typeof campaignApplicationSchema>

export const createApplicationSchema = campaignApplicationSchema.omit({
  id: true,
  status: true,
  brand_notes: true,
  rejection_reason: true,
  applied_at: true,
  reviewed_at: true,
})
export type CreateApplication = z.infer<typeof createApplicationSchema>