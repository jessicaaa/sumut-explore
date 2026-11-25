'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LupaSandi() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email'))
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-sandi`,
    })
    setLoading(false)
    toast.success('Jika email terdaftar, tautan reset sudah dikirim.')
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Lupa kata sandi</CardTitle>
        <CardDescription>Masukkan emailmu, kami kirim tautan untuk membuat sandi baru.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required /></div>
          <Button className="w-full" disabled={loading}>{loading ? 'Mengirim…' : 'Kirim tautan'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}