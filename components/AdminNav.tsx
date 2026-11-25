'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin', label: 'Ringkasan', exact: true },
  { href: '/admin/pengajuan', label: 'Pengajuan' },
  { href: '/admin/laporan', label: 'Laporan' },
  { href: '/admin/rencana', label: 'Rencana' },
  { href: '/admin/destinasi', label: 'Destinasi' },
  { href: '/admin/pengguna', label: 'Pengguna' },
  { href: '/admin/log', label: 'Log' },
]

export default function AdminNav() {
  const path = usePathname()
  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b pb-2">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href)
        return (
          <Link key={i.href} href={i.href}
            className={cn('whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
            {i.label}
          </Link>
        )
      })}
    </nav>
  )
}