import { NextRequest, NextResponse } from 'next/server'
import { createCampaignPayment, createOrRetrieveCustomer } from '@/app/lib/stripe/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealProposalId } = body

    if (!dealProposalId) {
      return NextResponse.json({ error: 'Deal proposal ID required' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get brand profile
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    // Get deal proposal with related data
    const { data: dealProposal, error: proposalError } = await supabase
      .from('deal_proposals')
      .select(`
        *,
        conversations (
          campaign_id,
          influencer_id,
          campaigns (
            title
          ),
          influencer_profiles (
            id,
            full_name,
            stripe_account_id
          )
        )
      `)
      .eq('id', dealProposalId)
      .single()

    if (proposalError || !dealProposal) {
      return NextResponse.json({ error: 'Deal proposal not found' }, { status: 404 })
    }

    if (dealProposal.status !== 'accepted') {
      return NextResponse.json({ error: 'Deal must be accepted before payment' }, { status: 400 })
    }

    const influencer = dealProposal.conversations.influencer_profiles
    if (!influencer.stripe_account_id) {
      return NextResponse.json(
        { error: 'Influencer has not set up payment account' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    const customer = await createOrRetrieveCustomer(
      user.email!,
      brandProfile.stripe_customer_id
    )

    // Update customer ID if new
    if (!brandProfile.stripe_customer_id) {
      await supabase
        .from('brand_profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', brandProfile.id)
    }

    // Create payment intent
    const paymentIntent = await createCampaignPayment(
      customer.id as string,
      dealProposal.budget,
      dealProposal.conversations.campaign_id,
      influencer.id,
      influencer.stripe_account_id,
      `Payment for ${dealProposal.conversations.campaigns.title} - ${influencer.full_name}`
    )

    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        type: 'payment',
        amount: dealProposal.budget,
        currency: 'BGN',
        status: 'pending',
        brand_id: brandProfile.id,
        influencer_id: influencer.id,
        campaign_id: dealProposal.conversations.campaign_id,
        deal_proposal_id: dealProposal.id,
        stripe_payment_intent_id: paymentIntent.id,
        platform_fee: Math.round(dealProposal.budget * 0.25),
      })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: dealProposal.budget,
    })
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}