'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function MarkReadButton() {
  const supabase = createClient()
  const router = useRouter()
  async function go() {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    router.refresh()
  }
  return <Button size="sm" variant="outline" onClick={go}>Tandai semua dibaca</Button>
}