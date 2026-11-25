import type { SupabaseClient } from '@supabase/supabase-js'

export async function logAdmin(
  supabase: SupabaseClient, action: string, targetType: string, targetId: string | number, note?: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('admin_logs').insert({
    admin_id: user.id, action, target_type: targetType, target_id: String(targetId), note: note ?? null,
  })
}