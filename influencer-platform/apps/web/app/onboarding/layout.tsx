import { requireAuth } from '@/app/lib/auth/utils'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {children}
    </div>
  )
}