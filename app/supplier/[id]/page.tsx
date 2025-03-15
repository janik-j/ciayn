import { Header } from "@/components/header"
import { SupplierDetail } from "@/components/supplier-detail"

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SupplierDetail id={params.id} />
      </main>
    </div>
  )
}

