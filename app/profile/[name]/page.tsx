import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import SupplierDossier from "@/components/supplier-dossier"

export default async function ProfilePage({ 
  params 
}: { 
  params: Promise<{ name: string }> | { name: string } 
}) {
  // Await the params
  const resolvedParams = await Promise.resolve(params)
  const decodedName = decodeURIComponent(resolvedParams.name)

  // Fetch supplier data from Supabase
  const { data: supplierData, error: supplierError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', decodedName)
    .single()

  if (supplierError || !supplierData) {
    notFound()
  }

  // Fetch ESG risk data
  const { data: esgRiskData, error: esgError } = await supabase
    .from('supplier_esg_risk')
    .select('*')
    .eq('supplier_id', supplierData.id)
    .single()

  // Fetch compliance data
  const { data: complianceData, error: complianceError } = await supabase
    .from('supplier_compliance')
    .select('*')
    .eq('supplier_id', supplierData.id)
    .single()
  
  // Format the data for the SupplierDossier component
  const formattedData = {
    id: supplierData.id,
    name: supplierData.name,
    industry: supplierData.industry,
    country: supplierData.country,
    employees: supplierData.employees,
    website: supplierData.website,
    esgRisk: {
      environmental: esgRiskData?.environmental || "Low",
      social: esgRiskData?.social || "Low",
      governance: esgRiskData?.governance || "Low",
    },
    redFlags: [],
    complianceStatus: {
      lksg: complianceData?.lksg || "Unknown",
      cbam: complianceData?.cbam || "Unknown",
      csdd: complianceData?.csdd || "Unknown",
      csrd: complianceData?.csrd || "Unknown",
      reach: complianceData?.reach || "Unknown",
    },
    recommendations: []
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Supplier Profile</h1>
        </div>
        <SupplierDossier initialData={formattedData} />
      </main>
    </div>
  )
} 