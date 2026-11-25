import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DestinationForm from '@/components/DestinationForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Edit Destinasi' }

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: d } = await supabase.from('destinations').select('*').eq('id', Number(id)).maybeSingle()
  if (!d || d.owner_id !== user.id) notFound()
  if (d.status === 'pending') redirect(`/owner/destinasi/${id}`)

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={d.status === 'draft' ? 'Lanjutkan Pengajuan' : 'Edit Destinasi'} description={d.name} />
      <DestinationForm userId={user.id} initial={d} />
    </div>
  )
}