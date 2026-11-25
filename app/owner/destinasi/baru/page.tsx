import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DestinationForm from '@/components/DestinationForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Tambah Destinasi' }

export default async function Baru() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Tambah Destinasi" description="Lima langkah. Boleh disimpan sebagai draf kapan saja." />
      <DestinationForm userId={user.id} />
    </div>
  )
}