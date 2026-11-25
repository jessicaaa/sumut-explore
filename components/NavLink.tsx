'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function NavLink({ href, label, onClick, block }: {
  href: string
  label: string
  onClick?: () => void
  block?: boolean
}) {
  const path = usePathname()
  const active = path === href || path.startsWith(href + '/')
  return (
    <Link href={href} onClick={onClick}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
        block && 'block text-base',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}>
      {label}
    </Link>
  )
}