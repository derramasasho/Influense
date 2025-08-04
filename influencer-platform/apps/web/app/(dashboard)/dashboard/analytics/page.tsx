import { createClient } from '@/app/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@influencer-platform/ui'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  Activity,
  Award,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@influencer-platform/ui'

export default async function AnalyticsPage() {
  const supabase = createClient()

  // Get platform stats
  const { data: stats } = await supabase
    .rpc('get_platform_stats')
    .single()

  // Get trending creators
  const { data: trendingCreators } = await supabase
    .rpc('get_trending_creators', { p_limit: 6 })

  // Get top campaigns
  const { data: topCampaigns } = await supabase
    .rpc('get_top_campaigns', { p_limit: 6 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Discover trending creators and top performing campaigns
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.total_influencers || 0} creators, {stats?.total_brands || 0} brands
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_campaigns || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {stats?.total_campaigns || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats?.total_platform_fees || 0).toLocaleString()} BGN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total fees collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Campaign Budget</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats?.avg_campaign_budget || 0).toFixed(0)} BGN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per campaign
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Creators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            Trending Creators
          </CardTitle>
          <CardDescription>
            Top performing influencers based on recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingCreators?.map((creator) => (
              <div
                key={creator.influencer_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={creator.profile_image} alt={creator.full_name} />
                    <AvatarFallback>
                      {creator.full_name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{creator.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{creator.username}</p>
                    <div className="flex gap-2 mt-1">
                      {creator.categories?.slice(0, 2).map((cat: string) => (
                        <span
                          key={cat}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {creator.total_followers?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">followers</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{creator.growth_rate?.toFixed(0)}% growth
                  </p>
                </div>
              </div>
            )) || (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No trending creators yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Top Performing Campaigns
          </CardTitle>
          <CardDescription>
            Campaigns with the highest engagement rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns?.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{campaign.title}</p>
                  <p className="text-sm text-muted-foreground">{campaign.brand_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <Activity className="h-3 w-3 mr-1" />
                      {campaign.application_rate?.toFixed(1)}% application rate
                    </span>
                    <span className="text-muted-foreground">
                      {campaign.applications} applications
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{campaign.budget} BGN</p>
                  <p className="text-xs text-muted-foreground">Budget</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns to display yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      {stats?.top_categories && stats.top_categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
            <CardDescription>
              Most active campaign categories on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.top_categories.map((category: any) => (
                <div
                  key={category.category}
                  className="px-4 py-2 rounded-full bg-primary/10 flex items-center gap-2"
                >
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ({category.count} campaigns)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}