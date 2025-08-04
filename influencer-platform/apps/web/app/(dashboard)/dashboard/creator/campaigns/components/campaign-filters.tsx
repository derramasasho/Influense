'use client'

import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as Popover from '@radix-ui/react-popover'
import { Button } from '@influencer-platform/ui'

const categories = [
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'travel', label: 'Travel' },
  { id: 'food', label: 'Food' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'tech', label: 'Tech' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
  { id: 'business', label: 'Business' },
]

const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
]

const budgetRanges = [
  { id: '0-500', label: 'Under 500 BGN', min: 0, max: 500 },
  { id: '500-1000', label: '500 - 1,000 BGN', min: 500, max: 1000 },
  { id: '1000-5000', label: '1,000 - 5,000 BGN', min: 1000, max: 5000 },
  { id: '5000+', label: '5,000+ BGN', min: 5000, max: null },
]

export function CampaignFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const selectedCategory = searchParams.get('category')
  const selectedPlatform = searchParams.get('platform')
  const selectedBudget = searchParams.get('budget')

  const handleFilterChange = (type: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(type, value)
    } else {
      params.delete(type)
    }

    router.push(`/dashboard/creator/campaigns?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/dashboard/creator/campaigns')
  }

  const activeFiltersCount = [selectedCategory, selectedPlatform, selectedBudget].filter(Boolean).length

  return (
    <div className="flex items-center gap-2">
      {/* Category Filter */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.label 
              : 'Category'
            }
            <ChevronDown className="h-3 w-3" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            align="start"
            className="z-50 bg-background rounded-xl border shadow-lg p-2 w-48"
          >
            <div className="space-y-1">
              <button
                onClick={() => handleFilterChange('category', null)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange('category', category.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Platform Filter */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {selectedPlatform 
              ? platforms.find(p => p.id === selectedPlatform)?.label 
              : 'Platform'
            }
            <ChevronDown className="h-3 w-3" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            align="start"
            className="z-50 bg-background rounded-xl border shadow-lg p-2 w-48"
          >
            <div className="space-y-1">
              <button
                onClick={() => handleFilterChange('platform', null)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                All Platforms
              </button>
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleFilterChange('platform', platform.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedPlatform === platform.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Budget Filter */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {selectedBudget 
              ? budgetRanges.find(b => b.id === selectedBudget)?.label 
              : 'Budget'
            }
            <ChevronDown className="h-3 w-3" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            align="start"
            className="z-50 bg-background rounded-xl border shadow-lg p-2 w-48"
          >
            <div className="space-y-1">
              <button
                onClick={() => handleFilterChange('budget', null)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                Any Budget
              </button>
              {budgetRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => handleFilterChange('budget', range.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedBudget === range.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-2"
        >
          <Filter className="h-3 w-3" />
          Clear ({activeFiltersCount})
        </Button>
      )}
    </div>
  )
}