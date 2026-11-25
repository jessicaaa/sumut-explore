import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import NavLink from './NavLink'
import MobileMenu from './MobileMenu'
import UserMenu from './UserMenu'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role = 'user'
  let name = ''
  let avatarUrl: string | null = null
  let unread = 0
  if (user) {
    const [{ data }, { count }] = await Promise.all([
      supabase.from('profiles').select('role,full_name,avatar_url').eq('id', user.id).single(),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ])
    role = data?.role ?? 'user'
    name = data?.full_name ?? user.email ?? ''
    avatarUrl = data?.avatar_url ?? null
    unread = count ?? 0
  }

  const items = [
    { href: '/destinasi', label: 'Destinasi' },
    { href: '/rencana', label: 'Rencana' },
    { href: '/faq', label: 'Cara Kerja' },
  ]
  if (user) items.push({ href: '/dashboard', label: 'Dashboard' })
  if (role === 'owner') items.push({ href: '/owner', label: 'Destinasi Saya' })
  if (role === 'admin') items.push({ href: '/admin', label: 'Admin' })

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-4 w-4" />
          </span>
          <span className="text-lg tracking-tight">SumUt <span className="text-primary">Explore</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((i) => <NavLink key={i.href} {...i} />)}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {user && <NotificationBell initial={unread} />}
          {user
            ? <UserMenu name={name} role={role} avatarUrl={avatarUrl} />
            : <Button asChild size="sm"><Link href="/login">Masuk</Link></Button>}
          <MobileMenu items={items} />
        </div>
      </div>
    </header>
  )
}