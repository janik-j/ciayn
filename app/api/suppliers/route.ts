import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// GET all suppliers with their risk and compliance data
export async function GET() {
  try {
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*');
    
    if (suppliersError) {
      return NextResponse.json({ error: suppliersError.message }, { status: 400 });
    }

    // Fetch esg risk data for all suppliers
    const { data: esgRiskData, error: esgError } = await supabase
      .from('supplier_esg_risk')
      .select('*')
      .in('supplier_id', suppliers.map(s => s.id));

    if (esgError) {
      return NextResponse.json({ error: esgError.message }, { status: 400 });
    }

    // Fetch compliance data for all suppliers
    const { data: complianceData, error: complianceError } = await supabase
      .from('supplier_compliance')
      .select('*')
      .in('supplier_id', suppliers.map(s => s.id));

    if (complianceError) {
      return NextResponse.json({ error: complianceError.message }, { status: 400 });
    }

    // Combine all data
    const formattedSuppliers = suppliers.map(supplier => {
      const riskData = esgRiskData.find(r => r.supplier_id === supplier.id) || {
        environmental: 'Low',
        social: 'Low',
        governance: 'Low',
        overall: 'Low'
      };
      
      const compliance = complianceData.find(c => c.supplier_id === supplier.id) || {
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
    });
    
    return NextResponse.json({ data: formattedSuppliers });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Refresh a supplier's risk assessment
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Update the last_updated timestamp
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ last_updated: now })
      .eq('id', id);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Random risk values for demonstration (in real app, this would be a calculated value)
    const riskLevels = ["Low", "Medium", "High"];
    const getRandomRisk = () => riskLevels[Math.floor(Math.random() * riskLevels.length)];
    
    const environmental = getRandomRisk();
    const social = getRandomRisk();
    const governance = getRandomRisk();
    
    // Determine overall risk (highest of the three)
    let overall = "Low";
    if (environmental === "High" || social === "High" || governance === "High") {
      overall = "High";
    } else if (environmental === "Medium" || social === "Medium" || governance === "Medium") {
      overall = "Medium";
    }

    // Update the risk assessment
    const { data, error: riskError } = await supabase
      .from('supplier_esg_risk')
      .upsert({
        supplier_id: id,
        environmental,
        social,
        governance,
        overall
      })
      .select();
    
    if (riskError) {
      return NextResponse.json({ error: riskError.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      data: {
        id,
        lastUpdated: now,
        esgRisk: {
          environmental,
          social,
          governance,
          overall
        }
      } 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 