import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role: string | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = data?.role ?? null
  }

  return (
    <nav className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-teal-700">SumUt Explore</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/destinations">Destinasi</Link>
          <Link href="/plans">Rencana</Link>
          {user && <Link href="/dashboard">Dashboard</Link>}
          {role === 'admin' && <Link href="/admin">Admin</Link>}
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-lg border px-3 py-1">Keluar</button>
            </form>
          ) : (
            <Link href="/login" className="rounded-lg bg-teal-600 px-3 py-1 text-white">Masuk</Link>
          )}
        </div>
      </div>
    </nav>
  )
}