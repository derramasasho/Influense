'use client'

import { format, parseISO, startOfMonth } from 'date-fns'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface CampaignPerformanceChartProps {
  campaigns: any[]
}

export function CampaignPerformanceChart({ campaigns }: CampaignPerformanceChartProps) {
  const chartData = useMemo(() => {
    // Group by month
    const monthlyData = campaigns.reduce((acc, campaign) => {
      const month = format(startOfMonth(parseISO(campaign.created_at)), 'MMM yyyy')
      
      if (!acc[month]) {
        acc[month] = {
          month,
          campaigns: 0,
          applications: 0,
          budget: 0,
          spent: 0,
        }
      }
      
      acc[month].campaigns++
      acc[month].applications += campaign.total_applications || 0
      acc[month].budget += campaign.budget || 0
      acc[month].spent += campaign.total_spent || 0
      
      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by date
    return Object.values(monthlyData)
      .sort((a, b) => {
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-6) // Last 6 months
  }, [campaigns])

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        No campaign data available yet
      </div>
    )
  }

  return (
    <ResponsiveContainer height={350} width="100%">
      <BarChart data={chartData}>
        <CartesianGrid className="stroke-muted" strokeDasharray="3 3" />
        <XAxis 
          className="text-xs" 
          dataKey="month"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'Budget' || name === 'Spent') {
              return [`${value} BGN`, name]
            }
            return [value, name]
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar
          dataKey="campaigns"
          fill="hsl(var(--primary))"
          name="Campaigns"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="applications"
          fill="#10b981"
          name="Applications"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}