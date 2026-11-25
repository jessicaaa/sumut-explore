import PageHeader from '@/components/PageHeader'
import { CONTACT_EMAIL } from '@/lib/config'

export const metadata = { title: 'Syarat Penggunaan & Kebijakan Privasi' }

const sections: [string, string[]][] = [
  ['Data yang kami simpan', [
    'Akun: nama, email, peran (traveler/pemilik wisata), dan waktu persetujuan syarat ini.',
    'Kontak: nomor WhatsApp dan Instagram yang kamu isi (opsional).',
    'Aktivitas: rencana perjalanan, permintaan gabung, laporan, dan notifikasi.',
    'Pemilik wisata: data destinasi, foto, dan dokumen bukti kepemilikan.',
  ]],
  ['Tujuan penggunaan data', [
    'Menjalankan layanan: menampilkan destinasi, mencocokkan traveler, dan mengirim notifikasi.',
    'Keamanan: memverifikasi destinasi dan menindaklanjuti laporan penyalahgunaan.',
    'Data tidak dijual dan tidak dipakai untuk iklan.',
  ]],
  ['Pembagian kontak', [
    'Kontakmu tidak tampil di halaman publik.',
    'Kontak hanya terbuka bagi pihak yang saling disetujui dalam satu rencana, dan hanya untuk koordinasi perjalanan.',
    'Dokumen bukti pemilik wisata hanya dapat dilihat oleh pemilik dan admin.',
  ]],
  ['Larangan', [
    'Memakai kontak orang lain untuk spam, penipuan, atau pelecehan.',
    'Membuat rencana atau destinasi palsu, atau menyebarkan informasi menyesatkan.',
    'Pelanggaran dapat berakibat rencana dihapus dan akun dinonaktifkan.',
  ]],
  ['Keselamatan', [
    'SumUt Explore belum memverifikasi identitas pengguna.',
    'Bertemulah di tempat umum, beri tahu orang terdekat, dan gunakan penilaianmu sendiri. Pertemuan dan perjalanan menjadi tanggung jawab masing-masing pengguna.',
  ]],
  ['Menghapus akun dan data', [
    `Kirim permintaan ke ${CONTACT_EMAIL} dari email akunmu. Akun dan datamu akan dihapus dalam 7 hari kerja.`,
    'Laporan penyalahgunaan terkait akunmu dapat disimpan seperlunya untuk keperluan keamanan.',
  ]],
]

export default function Privasi() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Syarat Penggunaan & Kebijakan Privasi" description="Terakhir diperbarui: November 2026" />
      <div className="space-y-8">
        {sections.map(([title, items]) => (
          <section key={title}>
            <h2 className="mb-2 text-lg font-semibold">{title}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{items.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        ))}
      </div>
    </div>
  )
}