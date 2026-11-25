import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/ProfileForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Profil' }

export default async function Profil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profil')
  const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!p) redirect('/')

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profil" description="Atur bagaimana kamu terlihat oleh calon teman jalan." />
      <ProfileForm p={p} email={user.email ?? ''} />
    </div>
  )
}