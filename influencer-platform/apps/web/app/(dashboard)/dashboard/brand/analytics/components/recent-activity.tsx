'use client'

import { formatDistanceToNow } from 'date-fns'
import { User, Calendar, DollarSign } from 'lucide-react'

interface RecentActivityProps {
  activities: any[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const influencer = activity.influencer_profiles
        const totalFollowers = 
          (influencer?.instagram_followers || 0) +
          (influencer?.youtube_subscribers || 0) +
          (influencer?.tiktok_followers || 0)

        return (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {influencer?.profile_image ? (
                  <img
                    src={influencer.profile_image}
                    alt={influencer.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    activity.status === 'accepted'
                      ? 'bg-green-500'
                      : activity.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-medium">
                  {influencer?.full_name || 'Unknown'}
                  <span className="text-muted-foreground font-normal">
                    {' '}applied to{' '}
                  </span>
                  {activity.campaigns?.title}
                </p>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {totalFollowers.toLocaleString()} followers
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {activity.proposed_budget} BGN
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-right">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'accepted'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : activity.status === 'rejected'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                }`}
              >
                {activity.status}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}