import { SupplierList } from "@/components/supplier-list"
import { ComplianceOverview } from "@/components/compliance-overview"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase/server"

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
export default async function SuppliersPage() {
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

  // Format the data for our components
  const formattedSuppliers = suppliers?.map((supplier: Supplier) => {
    const riskData = esgRiskData?.find((r: ESGRisk) => r.supplier_id === supplier.id) || {
      environmental: 'Low',
      social: 'Low',
      governance: 'Low',
      overall: 'Low'
    };
    
    const compliance = complianceData?.find((c: ComplianceStatus) => c.supplier_id === supplier.id) || {
      lksg: 'Unknown',
      cbam: 'Unknown',
      csdd: 'Unknown',
      csrd: 'Unknown',
      reach: 'Unknown'
    };

    return {
      id: supplier.id,
      name: supplier.name,
      industry: supplier.industry,
      country: supplier.country,
      employees: supplier.employees,
      website: supplier.website,
      lastUpdated: supplier.last_updated,
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
  }) || [];

  // Calculate compliance statistics for ComplianceOverview component
  const frameworks = [
    { name: "German Supply Chain Act", shortName: "LkSG" },
    { name: "Carbon Border Adjustment Mechanism", shortName: "CBAM" },
    { name: "Corporate Sustainability Due Diligence", shortName: "CSDD" },
    { name: "Corporate Sustainability Reporting", shortName: "CSRD" },
    { name: "Registration, Evaluation, Authorization of Chemicals", shortName: "REACH" }
  ];
  
  const frameworksWithStats = frameworks.map(framework => {
    const field = framework.shortName.toLowerCase();
    
    // Count different compliance statuses
    const compliantCount = complianceData?.filter((item: ComplianceStatus) => item[field] === 'Compliant').length || 0;
    const partialCount = complianceData?.filter((item: ComplianceStatus) => item[field] === 'Partially Compliant').length || 0;
    const nonCompliantCount = complianceData?.filter((item: ComplianceStatus) => item[field] === 'Non-Compliant').length || 0;
    const unknownCount = complianceData?.filter((item: ComplianceStatus) => 
      item[field] === 'Unknown' || item[field] === null || item[field] === undefined
    ).length || 0;
    
    return {
      name: framework.name,
      shortName: framework.shortName,
      description: getFrameworkDescription(framework.shortName),
      compliantCount,
      partialCount,
      nonCompliantCount,
      unknownCount,
      totalCount: suppliers?.length || 0
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 mb-6">
          {/* @ts-ignore - We know these components accept initialData props */}
          <ComplianceOverview initialData={frameworksWithStats} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Supplier Risk Assessments</h1>
        <p className="text-slate-500 mb-6">View and manage all supplier risk assessments</p>
        {/* @ts-ignore - We know these components accept initialData props */}
        <SupplierList initialData={formattedSuppliers} />
      </main>
    </div>
  )
}

// Helper function to get framework descriptions
function getFrameworkDescription(shortName: string): string {
  switch (shortName) {
    case 'LkSG':
      return 'Requires companies to identify risks of human rights violations and environmental destruction in their supply chains';
    case 'CBAM':
      return 'EU regulation to prevent carbon leakage by pricing carbon-intensive imports';
    case 'CSDD':
      return 'EU directive requiring companies to identify and address adverse human rights and environmental impacts';
    case 'CSRD':
      return 'EU directive requiring large companies to report on sustainability matters';
    case 'REACH':
      return 'EU regulation addressing the production and use of chemical substances';
    default:
      return '';
  }
}

