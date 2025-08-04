'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Card, Button } from '@influencer-platform/ui'
import { X, CreditCard, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  dealProposal: any
  onSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, dealProposal, onSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Create payment intent when modal opens
  useState(() => {
    if (isOpen && !clientSecret) {
      fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealProposalId: dealProposal.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            toast.error(data.error || 'Failed to initialize payment')
            onClose()
          }
        })
        .catch((error) => {
          console.error('Payment initialization error:', error)
          toast.error('Failed to initialize payment')
          onClose()
        })
    }
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Complete Payment
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">{dealProposal.budget} BGN</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Platform fee (25%)</span>
                <span>{Math.round(dealProposal.budget * 0.25)} BGN</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    {Math.round(dealProposal.budget * 1.25)} BGN
                  </span>
                </div>
              </div>
            </div>

            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#6366f1',
                      colorBackground: '#ffffff',
                      colorText: '#1f2937',
                      colorDanger: '#ef4444',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
                <CheckoutForm 
                  onSuccess={onSuccess} 
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CheckoutForm({ 
  onSuccess, 
  isLoading, 
  setIsLoading 
}: { 
  onSuccess: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/messages`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
      } else {
        toast.success('Payment successful!')
        onSuccess()
      }
    } catch (error: any) {
      toast.error('Payment failed')
      console.error('Payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secure and encrypted
      </p>
    </form>
  )
}