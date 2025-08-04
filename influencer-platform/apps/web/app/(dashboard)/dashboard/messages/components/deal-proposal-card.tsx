'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@influencer-platform/ui'
import { DollarSign, Calendar, Package, Check, X } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface DealProposalCardProps {
  proposal: any
  isOwnProposal: boolean
  userType: 'brand' | 'influencer'
  conversationId: string
}

export function DealProposalCard({ 
  proposal, 
  isOwnProposal,
  userType,
  conversationId 
}: DealProposalCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const handleResponse = async (action: 'accept' | 'reject') => {
    setIsUpdating(true)

    try {
      // Update proposal status
      const { error: proposalError } = await supabase
        .from('deal_proposals')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
        })
        .eq('id', proposal.id)

      if (proposalError) throw proposalError

      // Send system message
      const message = action === 'accept' 
        ? '✅ Deal proposal accepted! The collaboration is now confirmed.'
        : '❌ Deal proposal declined.'

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: proposal.id, // Use proposal ID as sender for system messages
          sender_type: 'system',
          message_type: 'system',
          content: message,
        })

      if (messageError) throw messageError

      toast.success(action === 'accept' ? 'Deal accepted!' : 'Deal declined')
    } catch (error: any) {
      toast.error(`Failed to ${action} deal`)
    } finally {
      setIsUpdating(false)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
  }

  return (
    <Card className="max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Deal Proposal</span>
          <span className={`text-xs px-2 py-1 rounded-full font-normal ${statusColors[proposal.status]}`}>
            {proposal.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Budget */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Budget
          </span>
          <span className="font-semibold">{proposal.budget} BGN</span>
        </div>

        {/* Deliverables */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 flex items-center">
            <Package className="h-4 w-4 mr-1" />
            Deliverables
          </p>
          <ul className="text-sm space-y-1">
            {proposal.deliverables?.map((d: any, index: number) => (
              <li key={index} className="text-sm">
                • {d.quantity}x {d.type} on {d.platform}
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline */}
        {(proposal.timeline?.start_date || proposal.timeline?.end_date) && (
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Timeline
            </p>
            <p className="text-sm">
              {proposal.timeline.start_date && 
                new Date(proposal.timeline.start_date).toLocaleDateString()
              }
              {proposal.timeline.start_date && proposal.timeline.end_date && ' - '}
              {proposal.timeline.end_date && 
                new Date(proposal.timeline.end_date).toLocaleDateString()
              }
            </p>
          </div>
        )}

        {/* Terms */}
        {proposal.terms && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Terms</p>
            <p className="text-sm">{proposal.terms}</p>
          </div>
        )}

        {/* Actions */}
        {!isOwnProposal && proposal.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleResponse('accept')}
              disabled={isUpdating}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleResponse('reject')}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}