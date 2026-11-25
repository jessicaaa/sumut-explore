import { ChevronDown } from 'lucide-react'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Cara Kerja & FAQ' }

const faqs = [
  ['Apakah kontak saya terlihat oleh semua orang?', 'Tidak. WhatsApp dan Instagram-mu hanya terbuka bagi pembuat rencana dan peserta yang sudah saling disetujui.'],
  ['Bagaimana cara bergabung ke rencana orang lain?', 'Buka detail rencana, klik "Ajukan Gabung". Pembuat rencana menerima notifikasi dan memutuskan menyetujui atau menolak.'],
  ['Kapan batas mengajukan gabung?', 'Maksimal H-3 sebelum tanggal berangkat, supaya pembuat rencana punya waktu mempersiapkan.'],
  ['Bagaimana kalau kuota sudah penuh?', 'Permintaan tidak bisa diajukan lagi. Pembuat rencana tidak bisa menyetujui melebihi kuota.'],
  ['Saya pemilik wisata, bagaimana mendaftarkan tempat saya?', 'Daftar sebagai pemilik, isi data destinasi, dan unggah bukti. Admin akan memverifikasi sebelum destinasi tayang.'],
  ['Dari mana data cuaca?', 'Dari Open-Meteo.com, diperbarui sekitar tiap satu jam. Prakiraan tersedia sampai 16 hari ke depan.'],
  ['Bagaimana kalau ada rencana atau pengguna mencurigakan?', 'Gunakan tombol "Laporkan". Admin menindaklanjuti laporan maksimal 2×24 jam.'],
  ['Apakah SumUt Explore memverifikasi identitas pengguna?', 'Belum. Bertemulah di tempat umum, beri tahu orang terdekat, dan gunakan penilaianmu sendiri.'],
]

export default function Faq() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Cara Kerja & FAQ" description="Pertanyaan yang sering muncul." />
      <div className="space-y-2">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-xl border bg-card px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {q}<ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}