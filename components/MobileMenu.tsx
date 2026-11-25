'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { buttonVariants } from '@/components/ui/button'
import NavLink from './NavLink'

export default function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'md:hidden' })}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Buka menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
        <nav className="space-y-1 px-4">
          {items.map((i) => <NavLink key={i.href} {...i} block onClick={() => setOpen(false)} />)}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
