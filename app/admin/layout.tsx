import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireRole(['admin'])
  if (!ctx) redirect('/')
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  )
}