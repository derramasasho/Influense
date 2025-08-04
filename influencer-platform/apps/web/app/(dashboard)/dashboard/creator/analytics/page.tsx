import { createClient } from '@/app/lib/supabase/server'
import { getUserProfile } from '@/app/lib/auth/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@influencer-platform/ui'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Eye,
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react'
import { PerformanceChart } from './components/performance-chart'
import { CategoryBreakdown } from './components/category-breakdown'
import { RecentPerformance } from './components/recent-performance'

export default async function CreatorAnalyticsPage() {
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

  // Get performance data
  const { data: performance } = await supabase
    .rpc('get_influencer_performance', {
      p_influencer_id: influencerProfile.id
    })
    .single()

  // Get analytics data
  const { data: analytics } = await supabase
    .from('influencer_analytics')
    .select('*')
    .eq('id', influencerProfile.id)
    .single()

  // Get campaign performance over time
  const { data: campaignHistory } = await supabase
    .from('campaign_applications')
    .select(`
      created_at,
      status,
      proposed_budget,
      campaigns (
        title,
        categories,
        brand_profiles (
          company_name
        )
      )
    `)
    .eq('influencer_id', influencerProfile.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate metrics
  const totalFollowers = (influencerProfile.instagram_followers || 0) + 
                       (influencerProfile.youtube_subscribers || 0) + 
                       (influencerProfile.tiktok_followers || 0)

  const engagementRate = totalFollowers > 0 
    ? ((analytics?.accepted_applications || 0) / totalFollowers * 100).toFixed(2)
    : '0'

  const growthRate = campaignHistory && campaignHistory.length > 0
    ? ((campaignHistory.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length / 
        Math.max(campaignHistory.length, 1)) * 100).toFixed(0)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your performance and growth
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.acceptance_rate?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance?.accepted_applications || 0} of {performance?.total_applications || 0} applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Campaign Value</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.avg_campaign_value?.toFixed(0) || '0'} BGN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per accepted campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>
              Your campaign applications and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={campaignHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Most successful categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={campaignHistory} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {influencerProfile.instagram_followers && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    IG
                  </div>
                  <span className="text-sm">Instagram</span>
                </div>
                <span className="font-semibold">
                  {influencerProfile.instagram_followers.toLocaleString()} followers
                </span>
              </div>
            )}

            {influencerProfile.youtube_subscribers && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                    YT
                  </div>
                  <span className="text-sm">YouTube</span>
                </div>
                <span className="font-semibold">
                  {influencerProfile.youtube_subscribers.toLocaleString()} subscribers
                </span>
              </div>
            )}

            {influencerProfile.tiktok_followers && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-bold">
                    TT
                  </div>
                  <span className="text-sm">TikTok</span>
                </div>
                <span className="font-semibold">
                  {influencerProfile.tiktok_followers.toLocaleString()} followers
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Campaign Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{performance?.total_applications || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Accepted</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {performance?.accepted_applications || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 rounded-full h-2"
                    style={{ 
                      width: `${performance?.acceptance_rate || 0}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {performance?.completed_campaigns || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 rounded-full h-2"
                    style={{ 
                      width: `${(performance?.completed_campaigns || 0) / Math.max(performance?.accepted_applications || 1, 1) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaign Performance</CardTitle>
          <CardDescription>
            Your latest campaign applications and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentPerformance campaigns={campaignHistory || []} />
        </CardContent>
      </Card>
    </div>
  )
}