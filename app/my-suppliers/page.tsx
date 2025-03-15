import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase/server"
import { SupplierListPage } from "@/components/supplier-list-page"

// Define interfaces for our data types
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
  [key: string]: string; // Index signature to allow string indexing
}

interface Supplier {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  last_updated: string;
}

// This is a server component that fetches data
export default async function MySuppliersPage() {
  // Fetch suppliers
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('*');

  // Fetch ESG risk data
  const { data: esgRiskData, error: esgError } = await supabase
    .from('supplier_esg_risk')
    .select('*');

  // Fetch compliance data
  const { data: complianceData, error: complianceError } = await supabase
    .from('supplier_compliance')
    .select('*');

  // Format data for the client components
  const formattedSuppliers = suppliers ? suppliers.map(supplier => {
    // Find risk data for this supplier
    const riskData = esgRiskData?.find(risk => risk.supplier_id === supplier.id) || {
      environmental: "Low",
      social: "Low",
      governance: "Low",
      overall: "Low"
    };
    
    // Find compliance data for this supplier
    const compliance = complianceData?.find(comp => comp.supplier_id === supplier.id) || {
      lksg: "Unknown",
      cbam: "Unknown",
      csdd: "Unknown", 
      csrd: "Unknown",
      reach: "Unknown"
    };
    
    // Format date
    const lastUpdated = new Date(supplier.last_updated).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return {
      id: supplier.id,
      name: supplier.name,
      industry: supplier.industry,
      country: supplier.country,
      employees: supplier.employees,
      website: supplier.website,
      lastUpdated,
      esgRisk: {
        environmental: riskData.environmental,
        social: riskData.social,
        governance: riskData.governance,
        overall: riskData.overall
      },
      complianceStatus: {
        lksg: compliance.lksg,
        cbam: compliance.cbam,
        csdd: compliance.csdd,
        csrd: compliance.csrd,
        reach: compliance.reach
      }
    };
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">My Suppliers</h1>
        </div>
        
        <SupplierListPage initialSuppliers={formattedSuppliers} />
      </main>
    </div>
  );
}

