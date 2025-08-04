'use client'

import { Button } from '@influencer-platform/ui'
import { CreditCard, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function ConnectAccountButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create account link')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect account')
      console.error('Connect account error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className="w-full" 
      disabled={isLoading}
      onClick={handleConnect}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Connect Bank Account
        </>
      )}
    </Button>
  )
}