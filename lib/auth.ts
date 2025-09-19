import { createClient } from './supabaseServer'
import { redirect } from 'next/navigation'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'member' | 'admin' | 'ops'
  organization_id: string | null
  created_at: string
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  return profile
}

export async function requireRole(roles: string[]): Promise<Profile> {
  const profile = await requireAuth()
  
  if (!roles.includes(profile.role)) {
    redirect('/unauthorized')
  }
  
  return profile
}

export async function requireMember(): Promise<Profile> {
  return requireRole(['member', 'admin', 'ops'])
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole(['admin', 'ops'])
}
