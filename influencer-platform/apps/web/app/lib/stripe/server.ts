import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Platform fee percentage (25%)
export const PLATFORM_FEE_PERCENT = 25

// Minimum transaction amount (50 BGN in stotinki)
export const MIN_AMOUNT = 5000

// Create a connected account for an influencer
export async function createConnectedAccount(
  email: string,
  influencerData: {
    id: string
    fullName: string
    country?: string
  }
) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: influencerData.country || 'BG',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        influencer_id: influencerData.id,
      },
    })

    return account
  } catch (error) {
    console.error('Error creating connected account:', error)
    throw error
  }
}

// Create account link for onboarding
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}

// Check if account is fully onboarded
export async function isAccountComplete(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return account.charges_enabled && account.payouts_enabled
  } catch (error) {
    console.error('Error checking account status:', error)
    return false
  }
}

// Create a payment intent for campaign payment
export async function createCampaignPayment(
  brandCustomerId: string,
  amount: number, // in BGN
  campaignId: string,
  influencerId: string,
  influencerAccountId: string,
  description: string
) {
  try {
    // Convert BGN to stotinki (smallest currency unit)
    const amountInStotinki = Math.round(amount * 100)
    
    // Calculate platform fee
    const platformFee = Math.round(amountInStotinki * PLATFORM_FEE_PERCENT / 100)
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInStotinki,
      currency: 'bgn',
      customer: brandCustomerId,
      description,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: influencerAccountId,
      },
      metadata: {
        campaign_id: campaignId,
        influencer_id: influencerId,
        platform_fee_percent: PLATFORM_FEE_PERCENT.toString(),
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Create or retrieve customer
export async function createOrRetrieveCustomer(
  email: string,
  customerId?: string | null
) {
  try {
    if (customerId) {
      return await stripe.customers.retrieve(customerId)
    }

    const customer = await stripe.customers.create({
      email,
    })

    return customer
  } catch (error) {
    console.error('Error creating/retrieving customer:', error)
    throw error
  }
}

// Create a refund
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as Stripe.RefundCreateParams.Reason,
    })

    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}

// Get account balance
export async function getAccountBalance(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    })

    return balance
  } catch (error) {
    console.error('Error retrieving balance:', error)
    throw error
  }
}

// Create payout
export async function createPayout(
  accountId: string,
  amount: number, // in BGN
  description?: string
) {
  try {
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency: 'bgn',
        description,
      },
      {
        stripeAccount: accountId,
      }
    )

    return payout
  } catch (error) {
    console.error('Error creating payout:', error)
    throw error
  }
}

// Get earnings for an influencer
export async function getInfluencerEarnings(accountId: string) {
  try {
    const balance = await getAccountBalance(accountId)
    
    const available = balance.available.reduce((sum, b) => sum + b.amount, 0)
    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0)
    
    return {
      available: available / 100, // Convert from stotinki to BGN
      pending: pending / 100,
      total: (available + pending) / 100,
    }
  } catch (error) {
    console.error('Error getting earnings:', error)
    return {
      available: 0,
      pending: 0,
      total: 0,
    }
  }
}