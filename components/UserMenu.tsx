'use client'
import Link from 'next/link'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const roleLabel: Record<string, string> = { user: 'Traveler', owner: 'Pemilik wisata', admin: 'Admin' }

export default function UserMenu({ name, role, avatarUrl }: { name: string; role: string; avatarUrl?: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'U'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu akun"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-9 w-9">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-primary/15 font-semibold text-primary">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{name}</p>
          <p className="text-xs font-normal text-muted-foreground">{roleLabel[role] ?? role}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
          </DropdownMenuItem>
        </Link>
        <Link href="/profil">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />Profil
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full text-left">
            <DropdownMenuItem className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />Keluar
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}