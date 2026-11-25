import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'

const font = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'SumUt Explore', template: '%s | SumUt Explore' },
  description: 'Rencanakan perjalanan dan temukan teman jalan di Sumatera Utara',
  openGraph: { siteName: 'SumUt Explore', locale: 'id_ID', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${font.className} flex min-h-screen flex-col bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} SumUt Explore · Proyek MPTI USU</p>
              <nav className="flex gap-4">
                <Link href="/privasi" className="hover:text-foreground">Privasi & Syarat</Link>
                <Link href="/destinasi" className="hover:text-foreground">Destinasi</Link>
                <Link href="/rencana" className="hover:text-foreground">Rencana</Link>
              </nav>
            </div>
          </footer>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}