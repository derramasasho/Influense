'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card } from '@influencer-platform/ui'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Calendar, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { createClient } from '@/app/lib/supabase/client'

const proposalSchema = z.object({
  budget: z.number().min(1, 'Budget must be greater than 0'),
  deliverables: z.array(z.object({
    type: z.string().min(1, 'Type is required'),
    platform: z.string().min(1, 'Platform is required'),
    quantity: z.number().int().min(1),
    description: z.string().optional(),
  })).min(1, 'Add at least one deliverable'),
  timeline: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }),
  terms: z.string().optional(),
})

type ProposalData = z.infer<typeof proposalSchema>

interface DealProposalModalProps {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  userType: 'brand' | 'influencer'
}

const deliverableTypes = [
  { value: 'post', label: 'Feed Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel/Short' },
  { value: 'video', label: 'Video' },
  { value: 'live', label: 'Live Stream' },
  { value: 'blog', label: 'Blog Post' },
]

const platforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'facebook', label: 'Facebook' },
]

export function DealProposalModal({ 
  isOpen, 
  onClose, 
  conversationId,
  userType 
}: DealProposalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProposalData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      deliverables: [{ type: 'post', platform: 'instagram', quantity: 1 }],
      timeline: {},
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliverables',
  })

  const onSubmit = async (data: ProposalData) => {
    setIsSubmitting(true)

    try {
      // Create the message first
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: conversationId, // We'll update this with proper user ID
          sender_type: userType,
          message_type: 'deal_proposal',
          content: `Deal proposal: ${data.budget} BGN for ${data.deliverables.length} deliverable(s)`,
        })
        .select()
        .single()

      if (messageError) throw messageError

      // Create the deal proposal
      const { error: proposalError } = await supabase
        .from('deal_proposals')
        .insert({
          conversation_id: conversationId,
          message_id: message.id,
          proposed_by: userType,
          budget: data.budget,
          deliverables: data.deliverables,
          timeline: data.timeline,
          terms: data.terms,
          status: 'pending',
        })

      if (proposalError) throw proposalError

      toast.success('Deal proposal sent!')
      reset()
      onClose()
    } catch (error: any) {
      toast.error('Failed to send proposal')
      console.error('Error sending proposal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold">
                Create Deal Proposal
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Budget (BGN)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    {...register('budget', { valueAsNumber: true })}
                    className="input-premium w-full pl-10"
                    placeholder="Enter amount"
                  />
                </div>
                {errors.budget && (
                  <p className="text-sm text-destructive mt-1">{errors.budget.message}</p>
                )}
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deliverables
                </label>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <select
                        {...register(`deliverables.${index}.type`)}
                        className="input-premium flex-1"
                      >
                        <option value="">Select type</option>
                        {deliverableTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <select
                        {...register(`deliverables.${index}.platform`)}
                        className="input-premium flex-1"
                      >
                        <option value="">Platform</option>
                        {platforms.map((platform) => (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        {...register(`deliverables.${index}.quantity`, { valueAsNumber: true })}
                        className="input-premium w-20"
                        min="1"
                        placeholder="Qty"
                      />
                      {fields.length > 1 && (
                        <button
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="mt-2 text-sm text-primary hover:underline flex items-center"
                  type="button"
                  onClick={() => append({ type: '', platform: '', quantity: 1 })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add deliverable
                </button>
                {errors.deliverables && (
                  <p className="text-sm text-destructive mt-1">{errors.deliverables.message}</p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Timeline (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register('timeline.start_date')}
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register('timeline.end_date')}
                      className="input-premium w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Terms (Optional)
                </label>
                <textarea
                  {...register('terms')}
                  className="input-premium w-full resize-none"
                  placeholder="Any specific requirements or terms..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  disabled={isSubmitting}
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Proposal'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}