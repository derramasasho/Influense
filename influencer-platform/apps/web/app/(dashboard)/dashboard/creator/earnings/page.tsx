import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@influencer-platform/ui'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Check,
  Clock,
  Download,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { ConnectAccountButton } from './components/connect-account-button'
import { PayoutButton } from './components/payout-button'
import { getUserProfile } from '@/app/lib/auth/utils'
import { getInfluencerEarnings, isAccountComplete } from '@/app/lib/stripe/server'
import { createClient } from '@/app/lib/supabase/server'

export default async function CreatorEarningsPage() {
  const supabase = createClient()
  const profile = await getUserProfile()

  // Get influencer profile
  const { data: influencerProfile } = await supabase
    .from('influencer_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  if (!influencerProfile) {
    return <div>Profile not found</div>
  }

  // Get earnings data
  let earnings = { available: 0, pending: 0, total: 0 }
  let accountComplete = false

  if (influencerProfile.stripe_account_id) {
    try {
      earnings = await getInfluencerEarnings(influencerProfile.stripe_account_id)
      accountComplete = await isAccountComplete(influencerProfile.stripe_account_id)
    } catch (error) {
      console.error('Error fetching earnings:', error)
    }
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      campaigns (
        title
      ),
      brand_profiles (
        company_name
      )
    `)
    .eq('influencer_id', influencerProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get earnings stats
  const { data: stats } = await supabase
    .from('transactions')
    .select('amount, platform_fee, status')
    .eq('influencer_id', influencerProfile.id)
    .eq('status', 'completed')

  const totalEarned = stats?.reduce((sum, t) => sum + (t.amount - t.platform_fee), 0) || 0
  const completedCampaigns = new Set(transactions?.filter(t => t.status === 'completed').map(t => t.campaign_id)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Earnings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your earnings and payouts
        </p>
      </div>

      {/* Stripe Connect Setup */}
      {!influencerProfile.stripe_account_id || !accountComplete ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Set Up Payments
            </CardTitle>
            <CardDescription>
              Connect your bank account to receive payments from brands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Quick & Secure Setup</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your bank account in just a few minutes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Get Paid Instantly</p>
                  <p className="text-sm text-muted-foreground">
                    Receive payments as soon as brands pay for your work
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Automatic Payouts</p>
                  <p className="text-sm text-muted-foreground">
                    Get paid directly to your bank account on a regular schedule
                  </p>
                </div>
              </div>
              <ConnectAccountButton />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings.available.toFixed(2)} BGN</div>
                <p className="text-xs text-muted-foreground">Ready to withdraw</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings.pending.toFixed(2)} BGN</div>
                <p className="text-xs text-muted-foreground">Being processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEarned.toFixed(2)} BGN</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                <Check className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCampaigns}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Payout Actions */}
          {earnings.available > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>
                  Transfer your available balance to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{earnings.available.toFixed(2)} BGN</p>
                    <p className="text-sm text-muted-foreground">Available for payout</p>
                  </div>
                  <PayoutButton 
                    accountId={influencerProfile.stripe_account_id}
                    amount={earnings.available}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your earnings history</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{transaction.campaigns?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.brand_profiles?.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          +{(transaction.amount - transaction.platform_fee).toFixed(2)} BGN
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (Fee: {transaction.platform_fee} BGN)
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">
                    Complete campaigns to start earning
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stripe Dashboard Link */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Manage your payment information and view detailed reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                className="inline-flex items-center text-primary hover:underline"
                href={`https://dashboard.stripe.com/express/${influencerProfile.stripe_account_id}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Stripe Dashboard
              </a>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}