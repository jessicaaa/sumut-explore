'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function NotificationBell({ initial }: { initial: number }) {
  const supabase = createClient()
  const [count, setCount] = useState(initial)
  const [items, setItems] = useState<any[]>([])

  async function onOpen(open: boolean) {
    if (!open) return
    const { data } = await supabase
      .from('notifications').select('id,title,body,link,is_read')
      .order('created_at', { ascending: false }).limit(8)
    setItems(data ?? [])
    if (count > 0) {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
      setCount(0)
    }
  }

  return (
    <DropdownMenu onOpenChange={onOpen}>
      <DropdownMenuTrigger aria-label="Notifikasi"
        className="relative rounded-md p-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-cta px-1 text-[10px] font-bold text-cta-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="max-h-96 divide-y overflow-y-auto">
          {items.length === 0 && <p className="p-4 text-sm text-muted-foreground">Belum ada notifikasi.</p>}
          {items.map((n) => (
            <Link key={n.id} href={n.link ?? '/dashboard'}
              className={cn('block px-4 py-3 text-sm hover:bg-accent', !n.is_read && 'bg-primary/5')}>
              <p className="font-medium">{n.title}</p>
              {n.body && <p className="text-muted-foreground">{n.body}</p>}
            </Link>
          ))}
        </div>
        <Link href="/dashboard?tab=notifikasi" className="block border-t px-4 py-2 text-center text-sm text-primary hover:bg-accent">
          Lihat semua
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}