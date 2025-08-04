import { getUserProfile } from '@/app/lib/auth/utils'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const profile = await getUserProfile()
  
  // Redirect to appropriate onboarding flow based on role
  if (profile.role === 'influencer') {
    redirect('/onboarding/creator')
  } else if (profile.role === 'brand') {
    redirect('/onboarding/brand')
  } else {
    redirect('/dashboard')
  }
}