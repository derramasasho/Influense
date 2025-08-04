import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { createPayout } from '@/app/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, accountId } = body

    if (!amount || !accountId) {
      return NextResponse.json(
        { error: 'Amount and account ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify account belongs to user
    const { data: profile } = await supabase
      .from('influencer_profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.stripe_account_id !== accountId) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 403 })
    }

    // Create payout
    const payout = await createPayout(
      accountId,
      amount,
      `Payout request from platform`
    )

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
    })
  } catch (error: any) {
    console.error('Payout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payout' },
      { status: 500 }
    )
  }
}