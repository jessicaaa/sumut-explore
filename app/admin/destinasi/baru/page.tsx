import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDestForm from '@/components/AdminDestForm'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Tambah Destinasi' }

export default async function Baru() {
  const ctx = await requireRole(['admin'])
  if (!ctx) redirect('/')
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Tambah Destinasi" description="Langsung tayang bila statusnya Tayang." />
      <AdminDestForm userId={ctx.user.id} />
    </div>
  )
}