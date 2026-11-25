import { notFound, redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import AdminDestForm from '@/components/AdminDestForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Edit Destinasi' }

export default async function EditDest({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireRole(['admin'])
  if (!ctx) redirect('/')
  const { data: d } = await ctx.supabase.from('destinations').select('*').eq('id', Number(id)).maybeSingle()
  if (!d) notFound()
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit Destinasi" description={d.name} />
      <AdminDestForm userId={ctx.user.id} initial={d} />
    </div>
  )
}