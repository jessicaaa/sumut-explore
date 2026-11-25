import Link from 'next/link'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import JoinButton from './JoinButton'
import ReportButton from './ReportButton'
import { rentang } from '@/lib/format'

export default function PlanCard({ p, destName, isMine }: { p: any; destName?: string; isMine: boolean }) {
  const full = p.approved_count >= p.max_buddies
  const closed = p.effective_status === 'closed'
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold leading-snug">
              <Link href={`/rencana/${p.id}`} className="hover:text-primary">{p.title}</Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />{destName ?? 'Destinasi'}
            </p>
          </div>
          {closed ? <Badge variant="secondary">Ditutup</Badge>
            : full ? <Badge variant="secondary">Penuh</Badge>
            : <Badge>Terbuka</Badge>}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{rentang(p.start_date, p.end_date)}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.approved_count}/{p.max_buddies} teman</span>
        </div>
        {p.description && <p className="line-clamp-2 text-sm">{p.description}</p>}
        <div className="flex items-center justify-between pt-1">
          {isMine ? <Badge variant="outline">Rencanamu</Badge>
            : full || closed ? <span className="text-sm text-muted-foreground">Tidak menerima permintaan</span>
            : <JoinButton planId={p.id} />}
          {!isMine && <ReportButton planId={p.id} />}
        </div>
      </CardContent>
    </Card>
  )
}