'use client'

import { Button } from '@influencer-platform/ui'
import { DollarSign, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/app/lib/supabase/client'

interface PayoutButtonProps {
  amount: number
  accountId: string
}

export function PayoutButton({ amount, accountId }: PayoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handlePayout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, accountId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Payout requested successfully!')
        
        // Record payout request
        await supabase
          .from('payout_requests')
          .insert({
            amount,
            status: 'pending',
            stripe_account_id: accountId,
          })

        // Refresh the page to update balance
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to request payout')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to request payout')
      console.error('Payout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      disabled={isLoading} 
      onClick={handlePayout}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <DollarSign className="h-4 w-4 mr-2" />
          Request Payout
        </>
      )}
    </Button>
  )
}