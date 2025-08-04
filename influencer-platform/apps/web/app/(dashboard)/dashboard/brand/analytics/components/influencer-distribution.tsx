'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface InfluencerDistributionProps {
  applications: any[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export function InfluencerDistribution({ applications }: InfluencerDistributionProps) {
  const chartData = useMemo(() => {
    // Group influencers by follower count ranges
    const ranges = {
      'Nano (1K-10K)': 0,
      'Micro (10K-50K)': 0,
      'Mid-tier (50K-100K)': 0,
      'Macro (100K-500K)': 0,
      'Mega (500K+)': 0,
    }

    applications.forEach((app) => {
      if (app.influencer_profiles) {
        const totalFollowers = 
          (app.influencer_profiles.instagram_followers || 0) +
          (app.influencer_profiles.youtube_subscribers || 0) +
          (app.influencer_profiles.tiktok_followers || 0)

        if (totalFollowers < 10000) {
          ranges['Nano (1K-10K)']++
        } else if (totalFollowers < 50000) {
          ranges['Micro (10K-50K)']++
        } else if (totalFollowers < 100000) {
          ranges['Mid-tier (50K-100K)']++
        } else if (totalFollowers < 500000) {
          ranges['Macro (100K-500K)']++
        } else {
          ranges['Mega (500K+)']++
        }
      }
    })

    // Convert to chart format
    return Object.entries(ranges)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }, [applications])

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No influencer data available
      </div>
    )
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        className="text-xs font-medium" 
        dominantBaseline="central" 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        x={x}
        y={y}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer height={300} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={chartData}
          dataKey="value"
          fill="#8884d8"
          label={renderCustomizedLabel}
          labelLine={false}
          outerRadius={80}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend 
          formatter={(value: string) => (
            <span style={{ fontSize: '12px' }}>{value}</span>
          )}
          height={36}
          verticalAlign="bottom"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}