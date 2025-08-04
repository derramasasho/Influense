'use client'

import { Button } from '@influencer-platform/ui'
import { Check, X, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/app/lib/supabase/client'

interface ApplicationActionsProps {
  application: any
  campaignId: string
}

export function ApplicationActions({ application, campaignId }: ApplicationActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsUpdating(true)

    try {
      const { error } = await supabase
        .from('campaign_applications')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id)

      if (error) throw error

      toast.success(
        action === 'accept' 
          ? 'Application accepted! A conversation has been created.' 
          : 'Application rejected'
      )
      
      router.refresh()

      // If accepted, redirect to messages after a short delay
      if (action === 'accept') {
        setTimeout(() => {
          router.push('/dashboard/messages')
        }, 2000)
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} application`)
      console.error('Error updating application:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (application.status !== 'pending') {
    if (application.status === 'accepted') {
      return (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-green-600 dark:text-green-400">
            ✓ Application accepted
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/dashboard/messages')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Go to Messages
          </Button>
        </div>
      )
    }

    return (
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Application {application.status}
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-3 pt-4 border-t">
      <Button
        className="flex-1"
        disabled={isUpdating}
        size="sm"
        onClick={() => handleAction('accept')}
      >
        <Check className="h-4 w-4 mr-1" />
        Accept & Start Chat
      </Button>
      <Button
        className="flex-1"
        disabled={isUpdating}
        size="sm"
        variant="outline"
        onClick={() => handleAction('reject')}
      >
        <X className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  )
}