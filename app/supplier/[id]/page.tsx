import { Header } from "@/components/header"
import { SupplierDetail } from "@/components/supplier-detail"
import { supabase } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  // Verify that the supplier exists in the database
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .select('id')
    .eq('id', params.id)
    .single();

  // If supplier not found, show 404 page
  if (error && error.code === 'PGRST116') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SupplierDetail id={params.id} />
      </main>
    </div>
  )
}

