import { z } from 'zod'

// Message type enum
export const messageTypeSchema = z.enum(['text', 'deal_proposal', 'file', 'system'])
export type MessageType = z.infer<typeof messageTypeSchema>

// Deal status enum
export const dealStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'cancelled'])
export type DealStatus = z.infer<typeof dealStatusSchema>

// Conversation schema
export const conversationSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  brand_id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  application_id: z.string().uuid().nullable(),
  last_message_at: z.string().datetime().nullable(),
  last_message_preview: z.string().nullable(),
  brand_unread_count: z.number().int().default(0),
  influencer_unread_count: z.number().int().default(0),
  is_archived: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Conversation = z.infer<typeof conversationSchema>

// Message schema
export const messageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  sender_type: z.enum(['brand', 'influencer', 'system']),
  message_type: messageTypeSchema,
  content: z.string(),
  metadata: z.record(z.any()).nullable(),
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
})
export type Message = z.infer<typeof messageSchema>

// Deal proposal schema
export const dealProposalSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  message_id: z.string().uuid(),
  proposed_by: z.enum(['brand', 'influencer']),
  budget: z.number().min(0),
  deliverables: z.array(z.object({
    type: z.string(),
    platform: z.string(),
    quantity: z.number().int().min(1),
    description: z.string().optional(),
  })),
  timeline: z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }),
  terms: z.string().optional(),
  status: dealStatusSchema,
  responded_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type DealProposal = z.infer<typeof dealProposalSchema>

// Create message schema
export const createMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  message_type: messageTypeSchema,
  content: z.string().min(1).max(5000),
  metadata: z.record(z.any()).optional(),
})
export type CreateMessage = z.infer<typeof createMessageSchema>

// Create deal proposal schema
export const createDealProposalSchema = z.object({
  conversation_id: z.string().uuid(),
  budget: z.number().min(0),
  deliverables: z.array(z.object({
    type: z.string(),
    platform: z.string(),
    quantity: z.number().int().min(1),
    description: z.string().optional(),
  })).min(1),
  timeline: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }).optional(),
  terms: z.string().optional(),
})
export type CreateDealProposal = z.infer<typeof createDealProposalSchema>