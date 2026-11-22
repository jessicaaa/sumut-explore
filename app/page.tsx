import Link from 'next/link'

export default function Home() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-sky-700 px-6 py-20 text-center text-white">
      <h1 className="text-4xl font-bold md:text-5xl">Jelajahi Sumatera Utara, tidak harus sendiri</h1>
      <p className="mx-auto mt-4 max-w-2xl text-teal-50">
        Info destinasi, rencana perjalanan, dan teman jalan yang cocok, dengan kontak yang hanya terbuka setelah disetujui.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/destinations" className="rounded-xl bg-orange-500 px-6 py-3 font-semibold">Lihat Destinasi</Link>
        <Link href="/plans" className="rounded-xl bg-white/15 px-6 py-3 font-semibold">Cari Teman Jalan</Link>
      </div>
    </section>
  )
}