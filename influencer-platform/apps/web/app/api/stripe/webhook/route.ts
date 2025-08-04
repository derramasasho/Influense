import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/app/lib/stripe/server'
import { createClient } from '@/app/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object

        // Update transaction status
        await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        // Update influencer earnings
        const { data: transaction } = await supabase
          .from('transactions')
          .select('influencer_id, amount, platform_fee')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (transaction) {
          const netAmount = transaction.amount - transaction.platform_fee
          
          await supabase.rpc('increment_influencer_earnings', {
            p_influencer_id: transaction.influencer_id,
            p_amount: netAmount,
          })
        }

        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object

        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            failed_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', failedPayment.id)

        break

      case 'account.updated':
        const account = event.data.object

        // Update influencer's Stripe account status
        if (account.metadata?.influencer_id) {
          await supabase
            .from('influencer_profiles')
            .update({
              stripe_account_status: account.charges_enabled ? 'active' : 'pending',
              stripe_payouts_enabled: account.payouts_enabled,
            })
            .eq('id', account.metadata.influencer_id)
        }

        break

      case 'payout.paid':
        const payout = event.data.object

        // Record payout in database
        await supabase
          .from('payouts')
          .insert({
            stripe_payout_id: payout.id,
            influencer_id: payout.metadata?.influencer_id,
            amount: payout.amount / 100, // Convert from cents
            currency: payout.currency.toUpperCase(),
            status: 'completed',
            arrival_date: payout.arrival_date,
          })

        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}