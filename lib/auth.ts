import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireRole(allowedRoles: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'user'
  if (profile?.is_active === false || !allowedRoles.includes(role)) {
    return null
  }

  return { supabase, user, role }
}

export async function requireAdmin() {
  const ctx = await requireRole(['admin'])
  if (!ctx) redirect('/login')
  return ctx
}