import { createClient } from '@/lib/supabase/server'
import PlanForm from '@/components/PlanForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Buat Rencana' }

export default async function Buat() {
  const supabase = await createClient()
  const { data: dests } = await supabase.from('destinations').select('id,name').eq('status', 'verified').order('name')
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Buat Rencana" description="Tiga langkah singkat, bisa disimpan sebagai draf." />
      <PlanForm dests={dests ?? []} />
    </div>
  )
}