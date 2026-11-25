'use client'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ShareButton({ id, title }: { id: number; title: string }) {
  function share() {
    const url = `${location.origin}/rencana/${id}`
    const text = `Ayo ikut rencana "${title}" di SumUt Explore: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  return (
    <Button size="sm" variant="outline" onClick={share}>
      <Share2 className="mr-1 h-4 w-4" />Bagikan
    </Button>
  )
}