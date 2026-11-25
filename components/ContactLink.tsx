'use client'
import { createClient } from '@/lib/supabase/client'

export default function ContactLink({ reqId, href, className, children }: {
  reqId: number; href: string; className?: string; children: React.ReactNode
}) {
  const supabase = createClient()
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}
      onClick={() => { supabase.rpc('mark_contact_opened', { p_request: reqId }).then(() => {}) }}>
      {children}
    </a>
  )
}