'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetSandi() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const password = String(new FormData(e.currentTarget).get('password'))
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Kata sandi diperbarui.')
    router.push('/')
    router.refresh()
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader><CardTitle>Buat kata sandi baru</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="password">Kata sandi baru</Label>
            <Input id="password" name="password" type="password" minLength={6} required autoComplete="new-password" /></div>
          <Button className="w-full" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}