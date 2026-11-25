import Link from 'next/link'
import { Plus, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { STATUS_UI } from '@/lib/dest'

export const metadata = { title: 'Destinasi Saya' }

export default async function OwnerHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('destinations').select('id,name,city,status,photos,updated_at')
    .eq('owner_id', user!.id).order('updated_at', { ascending: false })

  const count = (s: string) => (data ?? []).filter((d) => d.status === s).length
  const stats = [
    ['Total', data?.length ?? 0],
    ['Menunggu', count('pending')],
    ['Terverifikasi', count('verified')],
    ['Perlu revisi', count('revision')],
  ] as const

  const add = (
    <Button asChild className="bg-cta text-cta-foreground hover:bg-cta/90">
      <Link href="/owner/destinasi/baru"><Plus className="mr-1 h-4 w-4" />Tambah Destinasi</Link>
    </Button>
  )

  return (
    <>
      <PageHeader title="Destinasi Saya" description="Daftarkan tempat wisatamu dan pantau status verifikasinya." action={add} />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, n]) => (
          <Card key={label}><CardContent>
            <p className="text-3xl font-bold">{n}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </CardContent></Card>
        ))}
      </div>

      {data?.length ? (
        <div className="space-y-3">
          {data.map((d) => {
            const s = STATUS_UI[d.status]
            return (
              <Link key={d.id} href={`/owner/destinasi/${d.id}`} className="block">
                <Card className="transition hover:shadow-md">
                  <CardContent className="flex items-center gap-4">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-teal-600 to-sky-700">
                      {d.photos?.[0] && <img src={d.photos[0]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{d.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {d.city ?? 'Kota belum diisi'} · diperbarui {new Date(d.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={Store} title="Belum ada destinasi" description="Tambahkan destinasi pertamamu. Kamu bisa menyimpannya sebagai draf dulu." action={add} />
      )}
    </>
  )
}