import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import JoinButton from './JoinButton'
import { JOIN_DEADLINE_DAYS, todayStr } from '@/lib/config'

function Info({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export default function PlanAction({ plan, userId, myStatus }: {
  plan: any; userId?: string; myStatus?: string | null
}) {
  const daysLeft = Math.round(
    (new Date(plan.start_date + 'T00:00:00Z').getTime() - new Date(todayStr() + 'T00:00:00Z').getTime()) / 86400000
  )

  if (userId && plan.creator_id === userId)
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline">Ini rencanamu</Badge>
        <Button asChild size="sm" variant="outline"><Link href="/dashboard">Kelola di dashboard</Link></Button>
      </div>
    )
  if (plan.effective_status === 'completed') return <Info>Perjalanan ini sudah selesai.</Info>
  if (myStatus === 'pending') return <Badge variant="secondary">Menunggu persetujuan pembuat rencana</Badge>
  if (myStatus === 'approved')
    return (
      <div className="flex items-center gap-3">
        <Badge>Disetujui</Badge>
        <Button asChild size="sm" variant="outline"><Link href="/dashboard">Lihat kontak</Link></Button>
      </div>
    )
  if (myStatus === 'rejected') return <Badge variant="destructive">Permintaan ditolak</Badge>
  if (plan.effective_status === 'closed') return <Info>Pendaftaran rencana ini ditutup.</Info>
  if (plan.approved_count >= plan.max_buddies) return <Info>Kuota sudah penuh.</Info>
  if (daysLeft < JOIN_DEADLINE_DAYS) return <Info>Batas pengajuan (H-{JOIN_DEADLINE_DAYS}) sudah lewat.</Info>
  if (!userId)
    return (
      <Button asChild size="sm" className="bg-cta text-cta-foreground hover:bg-cta/90">
        <Link href={`/login?next=/rencana/${plan.id}`}>Masuk untuk bergabung</Link>
      </Button>
    )
  return <JoinButton planId={plan.id} />
}