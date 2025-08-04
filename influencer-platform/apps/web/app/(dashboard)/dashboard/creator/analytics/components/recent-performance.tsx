'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface RecentPerformanceProps {
  campaigns: any[]
}

export function RecentPerformance({ campaigns }: RecentPerformanceProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No campaign applications yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.slice(0, 10).map((campaign, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="flex-1 space-y-1">
            <p className="font-medium">{campaign.campaigns?.title}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{campaign.campaigns?.brand_profiles?.company_name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}</span>
            </div>
            {campaign.campaigns?.categories && (
              <div className="flex gap-2 mt-2">
                {campaign.campaigns.categories.slice(0, 3).map((category: string) => (
                  <span
                    key={category}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{campaign.proposed_budget} BGN</p>
              <p className="text-xs text-muted-foreground">Proposed</p>
            </div>
            
            <div className="flex items-center">
              {campaign.status === 'accepted' && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">Accepted</span>
                </div>
              )}
              {campaign.status === 'rejected' && (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">Rejected</span>
                </div>
              )}
              {campaign.status === 'pending' && (
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">Pending</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}