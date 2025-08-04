import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@influencer-platform/ui'
import { 
  Plus,
  MoreVertical,
  Users,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Pause,
  Play,
  Archive
} from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/app/lib/auth/utils'
import { createClient } from '@/app/lib/supabase/server'

export default async function BrandCampaignsPage() {
  const supabase = createClient()
  const profile = await getUserProfile()

  // Get brand profile
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('id')
    .eq('user_id', profile.id)
    .single()

  if (!brandProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Brand profile not found</p>
      </div>
    )
  }

  // Fetch brand's campaigns
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_applications (
        id,
        status
      )
    `)
    .eq('brand_id', brandProfile.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
  }

  const allCampaigns = campaigns || []

  // Calculate stats
  const activeCampaigns = allCampaigns.filter(c => c.status === 'active')
  const totalApplications = allCampaigns.reduce((sum, c) => sum + (c.campaign_applications?.length || 0), 0)
  const totalBudget = allCampaigns.reduce((sum, c) => sum + ((c.budget_min + c.budget_max) / 2), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">My Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your influencer campaigns
          </p>
        </div>
        <Link href="/dashboard/brand/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns.length} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalBudget)} BGN</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allCampaigns.length > 0 ? Math.round(totalApplications / allCampaigns.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per campaign</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {allCampaigns.map((campaign) => {
          const applications = campaign.campaign_applications || []
          const pendingApplications = applications.filter((a: any) => a.status === 'pending').length
          const acceptedApplications = applications.filter((a: any) => a.status === 'accepted').length

          return (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <CardDescription>
                      Created on {new Date(campaign.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">{campaign.budget_min} - {campaign.budget_max} BGN</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="font-medium">{applications.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="font-medium text-yellow-600">{pendingApplications}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <p className="font-medium text-green-600">{acceptedApplications}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="font-medium">{campaign.view_count || 0}</p>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.categories?.map((category: string) => (
                    <span key={category} className="px-2 py-1 rounded-full bg-muted text-xs">
                      {category}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/brand/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  {pendingApplications > 0 && (
                    <Link href={`/dashboard/brand/campaigns/${campaign.id}/applications`}>
                      <Button size="sm">
                        <Users className="h-3 w-3 mr-1" />
                        Review Applications ({pendingApplications})
                      </Button>
                    </Link>
                  )}

                  {campaign.status === 'active' && (
                    <Button size="sm" variant="ghost">
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  )}

                  {campaign.status === 'paused' && (
                    <Button size="sm" variant="ghost">
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {allCampaigns.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first campaign to start connecting with creators
          </p>
          <Link href="/dashboard/brand/campaigns/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}