'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryBreakdownProps {
  data: any[]
}

const COLORS = [
  '#6366f1', // primary
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
]

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const chartData = useMemo(() => {
    // Count campaigns by category
    const categoryCount = data.reduce((acc, item) => {
      if (item.campaigns?.categories) {
        item.campaigns.categories.forEach((category: string) => {
          acc[category] = (acc[category] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    // Convert to chart format and sort by count
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No category data available
      </div>
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
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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