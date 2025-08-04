'use client'

import { format, parseISO, startOfMonth } from 'date-fns'
import { useMemo } from 'react'
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface PerformanceChartProps {
  data: any[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    // Group by month
    const monthlyData = data.reduce((acc, item) => {
      const month = format(startOfMonth(parseISO(item.created_at)), 'MMM yyyy')
      
      if (!acc[month]) {
        acc[month] = {
          month,
          applications: 0,
          accepted: 0,
          earnings: 0,
        }
      }
      
      acc[month].applications++
      if (item.status === 'accepted') {
        acc[month].accepted++
        acc[month].earnings += item.proposed_budget || 0
      }
      
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
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        No data available yet
      </div>
    )
  }

  return (
    <ResponsiveContainer height={350} width="100%">
      <LineChart data={chartData}>
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
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          dataKey="applications"
          dot={{ fill: 'hsl(var(--primary))' }}
          name="Applications"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="accepted"
          dot={{ fill: '#10b981' }}
          name="Accepted"
          stroke="#10b981"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}