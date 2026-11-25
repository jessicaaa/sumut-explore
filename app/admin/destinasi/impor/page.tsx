import CsvImport from '@/components/CsvImport'
import PageHeader from '@/components/PageHeader'

export const metadata = { title: 'Impor CSV' }

export default function Impor() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Impor Destinasi dari CSV" description="Cocok untuk memasukkan banyak destinasi sekaligus. Hasilnya dicek dulu sebelum diimpor." />
      <CsvImport />
    </div>
  )
}