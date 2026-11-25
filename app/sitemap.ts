import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const supabase = await createClient()
  const [{ data: dests }, { data: plans }] = await Promise.all([
    supabase.from('destinations').select('slug,updated_at').eq('status', 'verified'),
    supabase.from('plans_view').select('id,created_at').eq('effective_status', 'open'),
  ])
  return [
    ...['', '/destinasi', '/rencana', '/faq', '/privasi'].map((p) => ({ url: `${base}${p}` })),
    ...(dests ?? []).map((d) => ({ url: `${base}/destinasi/${d.slug}`, lastModified: d.updated_at })),
    ...(plans ?? []).map((p) => ({ url: `${base}/rencana/${p.id}`, lastModified: p.created_at })),
  ]
}