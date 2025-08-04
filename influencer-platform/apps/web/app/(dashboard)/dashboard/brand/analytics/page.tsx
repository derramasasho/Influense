import { createClient } from '@/app/lib/supabase/server'
import { getUserProfile } from '@/app/lib/auth/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@influencer-platform/ui'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  Activity,
  Award,
  Clock
} from 'lucide-react'
import { CampaignPerformanceChart } from './components/campaign-performance-chart'
import { InfluencerDistribution } from './components/influencer-distribution'
import { TopCampaigns } from './components/top-campaigns'
import { RecentActivity } from './components/recent-activity'

export default async function BrandAnalyticsPage() {
  const supabase = createClient()
  const profile = await getUserProfile()

  // Get brand profile
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  if (!brandProfile) {
    return <div>Profile not found</div>
  }

  // Get brand analytics
  const { data: analytics } = await supabase
    .from('brand_analytics')
    .select('*')
    .eq('id', brandProfile.id)
    .single()

  // Get campaign analytics
  const { data: campaigns } = await supabase
    .from('campaign_analytics')
    .select('*')
    .eq('brand_id', brandProfile.id)
    .order('created_at', { ascending: false })

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('campaign_applications')
    .select(`
      *,
      campaigns!inner (
        id,
        title,
        brand_id
      ),
      influencer_profiles (
        full_name,
        username,
        profile_image,
        instagram_followers,
        youtube_subscribers,
        tiktok_followers
      )
    `)
    .eq('campaigns.brand_id', brandProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate metrics
  const totalBudgetSpent = campaigns?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0
  const totalApplications = campaigns?.reduce((sum, c) => sum + (c.total_applications || 0), 0) || 0
  const avgApplicationRate = campaigns && campaigns.length > 0
    ? (totalApplications / campaigns.length).toFixed(1)
    : '0'
  
  const successRate = totalApplications > 0
    ? ((campaigns?.reduce((sum, c) => sum + (c.accepted_applications || 0), 0) || 0) / totalApplications * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your campaign performance and ROI
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_campaigns || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.active_campaigns || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgetSpent.toLocaleString()} BGN</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencers Worked With</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.unique_influencers_worked_with || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique collaborations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Application acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Applications and budget over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignPerformanceChart campaigns={campaigns || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Influencer Distribution</CardTitle>
            <CardDescription>
              By follower count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InfluencerDistribution applications={recentActivity || []} />
          </CardContent>
        </Card>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Campaign Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Applications per Campaign</span>
              <span className="font-semibold">{avgApplicationRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Campaign Budget</span>
              <span className="font-semibold">
                {analytics?.avg_campaign_budget?.toFixed(0) || 0} BGN
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Messages Sent</span>
              <span className="font-semibold">{analytics?.total_messages_sent || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Campaigns</span>
              <span className="font-semibold">{analytics?.completed_campaigns_count || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
            <CardDescription>
              By application rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopCampaigns campaigns={campaigns || []} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest applications to your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity activities={recentActivity || []} />
        </CardContent>
      </Card>
    </div>
  )
}