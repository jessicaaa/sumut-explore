import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanForm from '@/components/PlanForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Edit Rencana' }

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/rencana/${id}/edit`)

  const { data: plan } = await supabase.from('plans').select('*').eq('id', Number(id)).maybeSingle()
  if (!plan || plan.creator_id !== user.id) notFound()
  const { data: dests } = await supabase.from('destinations').select('id,name').eq('status', 'verified').order('name')

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit Rencana" />
      <PlanForm dests={dests ?? []} initial={plan} />
    </div>
  )
}