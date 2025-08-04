import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@influencer-platform/ui'
import { formatDistanceToNow } from 'date-fns'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/app/lib/auth/utils'
import { createClient } from '@/app/lib/supabase/server'

export default async function CreatorDashboardPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  // Get influencer profile
  const { data: influencerProfile } = await supabase
    .from('influencer_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  // Get stats
  const { data: applications } = await supabase
    .from('campaign_applications')
    .select('*, campaigns(*)')
    .eq('influencer_id', influencerProfile?.id)
    .order('applied_at', { ascending: false })
    .limit(5)

  const { data: earnings } = await supabase
    .from('transactions')
    .select('amount')
    .eq('influencer_id', influencerProfile?.id)
    .eq('status', 'completed')

  const totalEarnings = earnings?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const pendingApplications = applications?.filter(a => a.status === 'pending').length || 0
  const acceptedApplications = applications?.filter(a => a.status === 'accepted').length || 0

  // Calculate growth (mock data for now)
  const earningsGrowth = 23.5
  const viewsGrowth = 12.8

  const stats = [
    {
      title: 'Total Earnings',
      value: `${totalEarnings.toLocaleString()} BGN`,
      change: earningsGrowth,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Campaigns',
      value: acceptedApplications.toString(),
      change: 0,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Profile Views',
      value: '2,847',
      change: viewsGrowth,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Applications',
      value: pendingApplications.toString(),
      change: 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted'
      case 'rejected':
        return 'Rejected'
      case 'pending':
        return 'Pending'
      default:
        return status
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-display font-bold">
          Welcome back, {profile.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your creator account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  {stat.change > 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500">+{stat.change}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-500">{stat.change}%</span>
                    </>
                  )}
                  <span className="ml-1">from last month</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Your latest campaign applications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold truncate">
                          {application.campaigns?.title}
                        </h4>
                        {getStatusIcon(application.status)}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                        </span>
                        <span className="text-xs font-medium">
                          {application.proposed_budget} BGN
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        application.status === 'accepted' 
                          ? 'bg-green-500/10 text-green-500'
                          : application.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No applications yet. Start browsing campaigns!
                </p>
                <Link className="btn-premium mt-4" href="/dashboard/creator/campaigns">
                  Browse Campaigns
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link
                className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-center"
                href="/dashboard/creator/campaigns"
              >
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-medium">Browse Campaigns</div>
              </Link>
              <Link
                className="p-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-center"
                href="/dashboard/creator/profile"
              >
                <div className="text-2xl mb-2">✏️</div>
                <div className="text-sm font-medium">Update Profile</div>
              </Link>
              <Link
                className="p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors text-center"
                href="/dashboard/creator/earnings"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium">View Earnings</div>
              </Link>
              <Link
                className="p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-center"
                href="/dashboard/creator/analytics"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium">Analytics</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion */}
      {influencerProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Strength</CardTitle>
            <CardDescription>
              Complete your profile to attract more brands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-bold">75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: '75%' }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic information added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Social accounts connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add portfolio items</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Verify your identity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}