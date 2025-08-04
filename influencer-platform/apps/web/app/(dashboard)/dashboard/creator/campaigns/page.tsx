import { createClient } from '@/app/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@influencer-platform/ui'
import { 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { CampaignFilters } from './components/campaign-filters'
import { CampaignSearch } from './components/campaign-search'

export default async function CreatorCampaignsPage() {
  const supabase = createClient()
  
  // Fetch active campaigns
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      brand_profiles (
        company_name,
        logo_url,
        verified
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching campaigns:', error)
  }

  const activeCampaigns = campaigns || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Browse Campaigns</h1>
        <p className="text-muted-foreground mt-2">
          Discover and apply to campaigns that match your style
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <CampaignSearch />
        </div>
        <CampaignFilters />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCampaigns.length > 0 
                ? Math.round(
                    activeCampaigns.reduce((sum, c) => sum + (c.budget_min + c.budget_max) / 2, 0) / 
                    activeCampaigns.length
                  )
                : 0} BGN
            </div>
            <p className="text-xs text-muted-foreground">Per campaign</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Fashion</div>
            <p className="text-xs text-muted-foreground">Most popular</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCampaigns.filter(c => {
                const createdAt = new Date(c.created_at)
                const today = new Date()
                return createdAt.toDateString() === today.toDateString()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Fresh opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCampaigns.map((campaign) => (
          <Link key={campaign.id} href={`/dashboard/creator/campaigns/${campaign.id}`}>
            <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
              {/* Brand Header */}
              <div className="p-4 border-b bg-gradient-to-r from-muted/50 to-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {campaign.brand_profiles?.logo_url ? (
                      <img 
                        src={campaign.brand_profiles.logo_url} 
                        alt={campaign.brand_profiles.company_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {campaign.brand_profiles?.company_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{campaign.brand_profiles?.company_name}</p>
                      {campaign.brand_profiles?.verified && (
                        <p className="text-xs text-primary">✓ Verified</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {campaign.budget_min} - {campaign.budget_max} BGN
                    </p>
                    <p className="text-xs text-muted-foreground">per creator</p>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {campaign.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.categories?.slice(0, 3).map((category: string) => (
                    <span 
                      key={category}
                      className="px-2 py-1 rounded-full bg-muted text-xs"
                    >
                      {category}
                    </span>
                  ))}
                  {campaign.categories?.length > 3 && (
                    <span className="px-2 py-1 rounded-full bg-muted text-xs">
                      +{campaign.categories.length - 3}
                    </span>
                  )}
                </div>

                {/* Deliverables */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-muted-foreground">Deliverables</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.deliverables?.slice(0, 2).map((d: any, index: number) => (
                      <span key={index} className="text-xs">
                        {d.quantity}x {d.type} on {d.platform}
                      </span>
                    ))}
                    {campaign.deliverables?.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{campaign.deliverables.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {campaign.location_requirements?.length > 0 && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {campaign.location_requirements[0]}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {campaign.total_applications || 0} applied
                    </span>
                  </div>
                  {campaign.application_deadline && (
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(campaign.application_deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {activeCampaigns.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground">
            Check back later for new opportunities or adjust your filters
          </p>
        </Card>
      )}
    </div>
  )
}