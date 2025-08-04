import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { createConnectedAccount, createAccountLink } from '@/app/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get influencer profile
    const { data: profile, error: profileError } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Influencer profile not found' }, { status: 404 })
    }

    // Check if already has Stripe account
    if (profile.stripe_account_id) {
      // Create account link for existing account
      const accountLink = await createAccountLink(
        profile.stripe_account_id,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/creator/earnings?refresh=true`,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/creator/earnings?success=true`
      )

      return NextResponse.json({ url: accountLink.url })
    }

    // Create new connected account
    const account = await createConnectedAccount(user.email!, {
      id: profile.id,
      fullName: profile.full_name,
      country: 'BG',
    })

    // Save account ID
    await supabase
      .from('influencer_profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', profile.id)

    // Create account link
    const accountLink = await createAccountLink(
      account.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/creator/earnings?refresh=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/creator/earnings?success=true`
    )

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}