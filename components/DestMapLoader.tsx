'use client'
import dynamic from 'next/dynamic'

const DestMap = dynamic(() => import('./DestMap'), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />,
})

export default function DestMapLoader({ items }: { items: any[] }) {
  return <DestMap items={items} />
}