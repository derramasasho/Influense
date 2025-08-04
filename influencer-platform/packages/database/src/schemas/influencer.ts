import { z } from 'zod'

export const influencerCategoriesSchema = z.enum([
  'fashion',
  'beauty',
  'lifestyle',
  'travel',
  'food',
  'fitness',
  'tech',
  'gaming',
  'music',
  'art',
  'photography',
  'business',
  'education',
  'entertainment',
  'sports',
  'parenting',
  'pets',
  'other'
])

export type InfluencerCategory = z.infer<typeof influencerCategoriesSchema>

export const socialPlatformSchema = z.enum([
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'linkedin',
  'twitch',
  'pinterest'
])

export type SocialPlatform = z.infer<typeof socialPlatformSchema>

export const influencerProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  bio: z.string().max(500).nullable(),
  location: z.string().nullable(),
  languages: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  instagram_handle: z.string().nullable(),
  instagram_followers: z.number().int().min(0).default(0),
  instagram_engagement_rate: z.number().min(0).max(100).nullable(),
  tiktok_handle: z.string().nullable(),
  tiktok_followers: z.number().int().min(0).default(0),
  tiktok_engagement_rate: z.number().min(0).max(100).nullable(),
  youtube_handle: z.string().nullable(),
  youtube_subscribers: z.number().int().min(0).default(0),
  youtube_engagement_rate: z.number().min(0).max(100).nullable(),
  twitter_handle: z.string().nullable(),
  twitter_followers: z.number().int().min(0).default(0),
  min_campaign_budget: z.number().min(0).nullable(),
  stripe_account_id: z.string().nullable(),
  stripe_account_status: z.string().nullable(),
  total_earnings: z.number().min(0).default(0),
  completed_campaigns: z.number().int().min(0).default(0),
  average_rating: z.number().min(0).max(5).default(0),
  verified: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type InfluencerProfile = z.infer<typeof influencerProfileSchema>

export const createInfluencerProfileSchema = influencerProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  total_earnings: true,
  completed_campaigns: true,
  average_rating: true,
})

export type CreateInfluencerProfile = z.infer<typeof createInfluencerProfileSchema>

export const updateInfluencerProfileSchema = influencerProfileSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type UpdateInfluencerProfile = z.infer<typeof updateInfluencerProfileSchema>