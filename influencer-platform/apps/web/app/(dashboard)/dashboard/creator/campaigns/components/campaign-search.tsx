'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function CampaignSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }

    startTransition(() => {
      router.push(`/dashboard/creator/campaigns?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        className="input-premium w-full pl-11 pr-4"
        defaultValue={searchParams.get('q') || ''}
        disabled={isPending}
        placeholder="Search campaigns..."
        type="text"
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}