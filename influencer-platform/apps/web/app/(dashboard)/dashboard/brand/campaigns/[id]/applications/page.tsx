import { createClient } from '@/app/lib/supabase/server'
import { getUserProfile } from '@/app/lib/auth/utils'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@influencer-platform/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@influencer-platform/ui'
import { 
  Users,
  Instagram,
  Youtube,
  ArrowLeft,
  Check,
  X,
  DollarSign,
  Star,
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { ApplicationActions } from './components/application-actions'

export default async function CampaignApplicationsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = createClient()
  const profile = await getUserProfile()

  // Get brand profile
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('id')
    .eq('user_id', profile.id)
    .single()

  if (!brandProfile) {
    return notFound()
  }

  // Fetch campaign with applications
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_applications (
        *,
        influencer_profiles (
          *,
          users (
            full_name,
            email
          )
        )
      )
    `)
    .eq('id', params.id)
    .eq('brand_id', brandProfile.id)
    .single()

  if (error || !campaign) {
    return notFound()
  }

  const applications = campaign.campaign_applications || []
  const pendingApplications = applications.filter((a: any) => a.status === 'pending')
  const acceptedApplications = applications.filter((a: any) => a.status === 'accepted')
  const rejectedApplications = applications.filter((a: any) => a.status === 'rejected')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard/brand/campaigns"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to campaigns
        </Link>
        
        <h1 className="text-3xl font-display font-bold">Applications</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage applications for "{campaign.title}"
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedApplications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedApplications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground">
              Applications will appear here once creators apply to your campaign
            </p>
          </Card>
        ) : (
          applications.map((application: any) => {
            const influencer = application.influencer_profiles
            const totalFollowers = 
              (influencer.instagram_followers || 0) +
              (influencer.youtube_subscribers || 0) +
              (influencer.tiktok_followers || 0)

            return (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={influencer.profile_image_url} />
                        <AvatarFallback>
                          {influencer.users?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{influencer.users?.full_name}</CardTitle>
                        <CardDescription>
                          {influencer.categories?.join(', ')}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {influencer.instagram_handle && (
                            <a 
                              href={`https://instagram.com/${influencer.instagram_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-primary"
                            >
                              <Instagram className="h-4 w-4 mr-1" />
                              {influencer.instagram_followers?.toLocaleString() || 0}
                            </a>
                          )}
                          {influencer.youtube_handle && (
                            <a 
                              href={`https://youtube.com/@${influencer.youtube_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-primary"
                            >
                              <Youtube className="h-4 w-4 mr-1" />
                              {influencer.youtube_subscribers?.toLocaleString() || 0}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applied {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Proposal */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Proposal</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.proposal_text}
                    </p>
                  </div>

                  {/* Budget & Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Proposed Budget</p>
                      <p className="font-semibold flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {application.proposed_budget} BGN
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reach</p>
                      <p className="font-semibold">{totalFollowers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <p className="font-semibold flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {influencer.engagement_rate || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{influencer.location || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Portfolio Links */}
                  {application.portfolio_links?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Portfolio</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.portfolio_links.map((link: string, index: number) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View work {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <ApplicationActions 
                    application={application}
                    campaignId={campaign.id}
                  />
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}