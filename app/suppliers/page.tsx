import { SupplierList } from "@/components/supplier-list"
import { Header } from "@/components/header"

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Supplier Risk Assessments</h1>
        <p className="text-slate-500 mb-6">View and manage all supplier risk assessments</p>
        <SupplierList />
      </main>
    </div>
  )
}

