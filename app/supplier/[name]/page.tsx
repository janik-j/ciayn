import { Header } from "@/components/header"
import SupplierDossier from "@/components/supplier-dossier"
import { supabase } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

// Define types for the Supplier data
interface Supplier {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  last_updated: string;
}

interface ESGRisk {
  supplier_id: string;
  environmental: "Low" | "Medium" | "High";
  social: "Low" | "Medium" | "High";
  governance: "Low" | "Medium" | "High";
  overall: "Low" | "Medium" | "High";
}

interface ComplianceStatus {
  supplier_id: string;
  lksg: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
}

export default async function SupplierPage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name)
  
  // Fetch supplier data from Supabase
  const { data: supplierData, error: supplierError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', decodedName)
    .single();

  if (supplierError || !supplierData) {
    notFound();
  }

  // Fetch ESG risk data
  const { data: esgRiskData, error: esgError } = await supabase
    .from('supplier_esg_risk')
    .select('*')
    .eq('supplier_id', supplierData.id)
    .single();

  // Fetch compliance data
  const { data: complianceData, error: complianceError } = await supabase
    .from('supplier_compliance')
    .select('*')
    .eq('supplier_id', supplierData.id)
    .single();
  
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
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Supplier Details</h1>
        </div>
        <SupplierDossier initialData={formattedData} />
      </main>
    </div>
  );
} 