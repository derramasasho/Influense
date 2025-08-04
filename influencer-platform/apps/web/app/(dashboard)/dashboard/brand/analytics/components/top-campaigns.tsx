'use client'

import { TrendingUp } from 'lucide-react'

interface TopCampaignsProps {
  campaigns: any[]
}

export function TopCampaigns({ campaigns }: TopCampaignsProps) {
  // Sort campaigns by application rate
  const topCampaigns = campaigns
    .filter(c => c.total_applications > 0)
    .sort((a, b) => {
      const rateA = (a.total_applications / Math.max(a.views || 1, 1)) * 100
      const rateB = (b.total_applications / Math.max(b.views || 1, 1)) * 100
      return rateB - rateA
    })
    .slice(0, 5)

  if (topCampaigns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No campaigns with applications yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {topCampaigns.map((campaign, index) => {
        const applicationRate = campaign.views > 0 
          ? ((campaign.total_applications / campaign.views) * 100).toFixed(1)
          : '0'
        
        return (
          <div
            key={campaign.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-sm line-clamp-1">{campaign.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{campaign.total_applications} applications</span>
                <span>•</span>
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {applicationRate}% rate
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{campaign.budget} BGN</p>
              <p className="text-xs text-muted-foreground">Budget</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}