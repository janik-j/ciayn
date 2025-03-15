import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// GET compliance overview statistics
export async function GET() {
  try {
    // Frameworks to calculate statistics for
    const frameworks = [
      { name: "German Supply Chain Act", shortName: "LkSG" },
      { name: "Carbon Border Adjustment Mechanism", shortName: "CBAM" },
      { name: "Corporate Sustainability Due Diligence", shortName: "CSDD" },
      { name: "Corporate Sustainability Reporting", shortName: "CSRD" },
      { name: "Registration, Evaluation, Authorization of Chemicals", shortName: "REACH" }
    ];
    
    // Get count of all suppliers for total count
    const { count: totalCount, error: countError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }
    
    // Get compliance data
    const { data: complianceData, error: complianceError } = await supabase
      .from('supplier_compliance')
      .select('*');
    
    if (complianceError) {
      return NextResponse.json({ error: complianceError.message }, { status: 400 });
    }
    
    // Calculate statistics for each framework
    const frameworksWithStats = frameworks.map(framework => {
      const field = framework.shortName.toLowerCase();
      
      // Count different compliance statuses
      const compliantCount = complianceData.filter(item => item[field] === 'Compliant').length;
      const partialCount = complianceData.filter(item => item[field] === 'Partially Compliant').length;
      const nonCompliantCount = complianceData.filter(item => item[field] === 'Non-Compliant').length;
      const unknownCount = complianceData.filter(item => 
        item[field] === 'Unknown' || item[field] === null || item[field] === undefined
      ).length;
      
      return {
        name: framework.name,
        shortName: framework.shortName,
        description: getFrameworkDescription(framework.shortName),
        compliantCount,
        partialCount,
        nonCompliantCount,
        unknownCount,
        totalCount: totalCount || 0
      };
    });
    
    return NextResponse.json({ data: frameworksWithStats });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
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