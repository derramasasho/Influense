import { createClient } from '@/app/lib/supabase/server'
import { getUserProfile } from '@/app/lib/auth/utils'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@influencer-platform/ui'
import { 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users,
  CheckCircle2,
  Building2,
  Target,
  Package,
  Clock,
  Globe,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { ApplicationForm } from './components/application-form'

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const profile = await getUserProfile()

  // Fetch campaign details
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      brand_profiles (
        id,
        company_name,
        logo_url,
        verified,
        description,
        website
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !campaign) {
    notFound()
  }

  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('campaign_applications')
    .select('id, status')
    .eq('campaign_id', params.id)
    .eq('influencer_id', profile.id)
    .single()

  const hasApplied = !!existingApplication
  const applicationStatus = existingApplication?.status

  // Get influencer profile for application
  const { data: influencerProfile } = await supabase
    .from('influencer_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  const isEligible = !influencerProfile?.min_followers || 
    (influencerProfile.instagram_followers || 0) >= (campaign.min_followers || 0)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/creator/campaigns"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center"
        >
          ← Back to campaigns
        </Link>
        
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">{campaign.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {campaign.brand_profiles.company_name}
              </span>
              {campaign.brand_profiles.verified && (
                <span className="flex items-center text-primary">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Verified Brand
                </span>
              )}
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Posted {new Date(campaign.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Application Status */}
          {hasApplied && (
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' :
              applicationStatus === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
              applicationStatus === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
              'bg-muted text-muted-foreground'
            }`}>
              {applicationStatus === 'pending' && 'Application Pending'}
              {applicationStatus === 'accepted' && '✓ Application Accepted'}
              {applicationStatus === 'rejected' && '✗ Application Rejected'}
              {applicationStatus === 'withdrawn' && 'Application Withdrawn'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Campaign Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {campaign.objectives?.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Deliverables
              </CardTitle>
              <CardDescription>Content you'll need to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaign.deliverables?.map((deliverable: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">
                        {deliverable.quantity}x {deliverable.type} on {deliverable.platform}
                      </p>
                      {deliverable.description && (
                        <p className="text-sm text-muted-foreground mt-1">{deliverable.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>What the brand is looking for</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {campaign.requirements?.map((requirement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>

              {/* Additional Requirements */}
              <div className="mt-6 space-y-3">
                {campaign.min_followers && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Minimum {campaign.min_followers.toLocaleString()} followers</span>
                  </div>
                )}
                {campaign.location_requirements?.length > 0 && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Location: {campaign.location_requirements.join(', ')}</span>
                  </div>
                )}
                {campaign.language_requirements?.length > 0 && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Languages: {campaign.language_requirements.join(', ')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Brand Info */}
          <Card>
            <CardHeader>
              <CardTitle>About {campaign.brand_profiles.company_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                {campaign.brand_profiles.logo_url ? (
                  <img 
                    src={campaign.brand_profiles.logo_url} 
                    alt={campaign.brand_profiles.company_name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold">
                      {campaign.brand_profiles.company_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    {campaign.brand_profiles.description || 'No description available'}
                  </p>
                  {campaign.brand_profiles.website && (
                    <a 
                      href={campaign.brand_profiles.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit website →
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Budget</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {campaign.budget_min} - {campaign.budget_max} BGN
              </div>
              <p className="text-sm text-muted-foreground mt-1">per creator</p>
              
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  💡 You'll receive 75% of the agreed amount after platform fees
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaign.application_deadline && (
                <div>
                  <p className="text-sm font-medium">Application Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.application_deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {campaign.start_date && (
                <div>
                  <p className="text-sm font-medium">Campaign Start</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {campaign.end_date && (
                <div>
                  <p className="text-sm font-medium">Campaign End</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {campaign.categories?.map((category: string) => (
                  <span 
                    key={category}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platforms */}
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {campaign.platforms?.map((platform: string) => (
                  <span 
                    key={platform}
                    className="px-3 py-1 rounded-full bg-muted text-sm capitalize"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Apply Section */}
          {!hasApplied && campaign.status === 'active' && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Ready to apply?</CardTitle>
                <CardDescription>
                  Submit your proposal to collaborate with {campaign.brand_profiles.company_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isEligible ? (
                  <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
                    <p className="text-sm flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      You don't meet the minimum follower requirement for this campaign
                    </p>
                  </div>
                ) : (
                  <ApplicationForm 
                    campaignId={campaign.id}
                    brandId={campaign.brand_profiles.id}
                    minBudget={campaign.budget_min}
                    maxBudget={campaign.budget_max}
                    deliverables={campaign.deliverables}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Status Card */}
          {hasApplied && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Your Application</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  {applicationStatus === 'pending' && (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <p className="font-medium mb-2">Application under review</p>
                      <p className="text-sm text-muted-foreground">
                        The brand will review your application and get back to you soon
                      </p>
                    </>
                  )}
                  {applicationStatus === 'accepted' && (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="font-medium mb-2">Congratulations! 🎉</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your application has been accepted
                      </p>
                      <Button size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Go to Messages
                      </Button>
                    </>
                  )}
                  {applicationStatus === 'rejected' && (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="font-medium mb-2">Application not selected</p>
                      <p className="text-sm text-muted-foreground">
                        Don't worry! There are many other opportunities waiting for you
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}