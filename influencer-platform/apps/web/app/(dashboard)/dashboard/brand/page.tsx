import { getUserProfile } from '@/app/lib/auth/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@influencer-platform/ui'
import { PlusCircle, Users, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function BrandDashboardPage() {
  const profile = await getUserProfile()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-display font-bold">
          Welcome back, {profile.full_name} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Ready to connect with amazing creators for your brand?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/brand/campaigns/new">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Create Campaign
              </CardTitle>
              <PlusCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Launch a new campaign to find creators
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/brand/creators">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Find Creators
              </CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Browse and connect with verified creators
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/brand/campaigns">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Campaigns
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Manage your active campaigns
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/brand/analytics">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Analytics
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Track campaign performance
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            More features for brands are on the way!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Campaign creation, creator search, analytics, and more features will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}