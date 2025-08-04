'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@influencer-platform/ui'
import { Send, Plus, X, Link as LinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import type { Deliverable } from '@influencer-platform/database'
import { createClient } from '@/app/lib/supabase/client'

const applicationSchema = z.object({
  proposalText: z.string()
    .min(50, 'Proposal must be at least 50 characters')
    .max(1000, 'Proposal must be less than 1000 characters'),
  proposedBudget: z.number()
    .min(1, 'Budget must be greater than 0'),
  portfolioLinks: z.array(z.string().url('Please enter valid URLs')).max(5),
})

type ApplicationData = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  campaignId: string
  brandId: string
  minBudget: number
  maxBudget: number
  deliverables: Deliverable[]
}

export function ApplicationForm({ 
  campaignId, 
  brandId,
  minBudget, 
  maxBudget,
  deliverables 
}: ApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([''])
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      proposedBudget: minBudget,
      portfolioLinks: [''],
    },
  })

  const proposalLength = watch('proposalText')?.length || 0
  const proposedBudget = watch('proposedBudget')

  const addPortfolioLink = () => {
    if (portfolioLinks.length < 5) {
      setPortfolioLinks([...portfolioLinks, ''])
    }
  }

  const removePortfolioLink = (index: number) => {
    const newLinks = portfolioLinks.filter((_, i) => i !== index)
    setPortfolioLinks(newLinks.length > 0 ? newLinks : [''])
    setValue('portfolioLinks', newLinks.filter(Boolean))
  }

  const updatePortfolioLink = (index: number, value: string) => {
    const newLinks = [...portfolioLinks]
    newLinks[index] = value
    setPortfolioLinks(newLinks)
    setValue('portfolioLinks', newLinks.filter(Boolean))
  }

  const onSubmit = async (data: ApplicationData) => {
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get influencer profile
      const { data: influencerProfile } = await supabase
        .from('influencer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!influencerProfile) throw new Error('Influencer profile not found')

      // Create application
      const { error } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerProfile.id,
          proposal_text: data.proposalText,
          proposed_budget: data.proposedBudget,
          proposed_deliverables: deliverables, // Use campaign deliverables for now
          portfolio_links: data.portfolioLinks.filter(Boolean),
          status: 'pending',
        })

      if (error) throw error

      // Update campaign application count
      await supabase.rpc('increment_campaign_applications', { campaign_id: campaignId })

      toast.success('Application submitted successfully! 🎉')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Proposal */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Proposal
        </label>
        <textarea
          {...register('proposalText')}
          className="input-premium w-full resize-none"
          placeholder="Tell the brand why you're perfect for this campaign..."
          rows={4}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            {proposalLength}/1000 characters
          </p>
          {errors.proposalText && (
            <p className="text-xs text-destructive">{errors.proposalText.message}</p>
          )}
        </div>
      </div>

      {/* Proposed Budget */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Proposed Budget (BGN)
        </label>
        <input
          type="number"
          {...register('proposedBudget', { valueAsNumber: true })}
          className="input-premium w-full"
          max={maxBudget}
          min={minBudget}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Budget range: {minBudget} - {maxBudget} BGN
        </p>
        {errors.proposedBudget && (
          <p className="text-xs text-destructive mt-1">{errors.proposedBudget.message}</p>
        )}
      </div>

      {/* Portfolio Links */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Portfolio Links (Optional)
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Share examples of your previous work
        </p>
        <div className="space-y-2">
          {portfolioLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="input-premium w-full pl-10"
                  placeholder="https://example.com/your-work"
                  type="url"
                  value={link}
                  onChange={(e) => updatePortfolioLink(index, e.target.value)}
                />
              </div>
              {portfolioLinks.length > 1 && (
                <button
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {portfolioLinks.length < 5 && (
          <button
            className="mt-2 text-sm text-primary hover:underline flex items-center"
            type="button"
            onClick={addPortfolioLink}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add another link
          </button>
        )}
        {errors.portfolioLinks && (
          <p className="text-xs text-destructive mt-1">Please enter valid URLs</p>
        )}
      </div>

      {/* Deliverables Info */}
      <div className="p-4 rounded-xl bg-muted/50">
        <p className="text-sm font-medium mb-2">You'll deliver:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {deliverables.map((d, index) => (
            <li key={index}>
              • {d.quantity}x {d.type} on {d.platform}
            </li>
          ))}
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        className="w-full"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Application
          </>
        )}
      </Button>
    </form>
  )
}