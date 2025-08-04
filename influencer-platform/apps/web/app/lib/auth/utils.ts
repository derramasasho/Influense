import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function getUserProfile() {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    redirect('/onboarding')
  }
  
  return profile
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getUserProfile()
  
  if (!allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }
  
  return profile
}