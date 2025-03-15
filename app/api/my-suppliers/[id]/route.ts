import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('Fetching supplier with ID:', id);
    
    // Fetch the supplier
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (supplierError) {
      console.error('Error fetching supplier:', supplierError);
      if (supplierError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
      return NextResponse.json({ error: supplierError.message }, { status: 400 });
    }

    console.log('Found supplier:', supplier);

    // Fetch esg risk data
    const { data: riskData, error: riskError } = await supabase
      .from('supplier_esg_risk')
      .select('*')
      .eq('supplier_id', id)
      .single();
    
    console.log('Risk data:', riskData, 'Error:', riskError);

    // Fetch compliance data
    const { data: complianceData, error: complianceError } = await supabase
      .from('supplier_compliance')
      .select('*')
      .eq('supplier_id', id)
      .single();
    
    console.log('Compliance data:', complianceData, 'Error:', complianceError);

    // Format the data
    const formattedSupplier = {
      id: supplier.id,
      name: supplier.name || 'Unknown Supplier',
      industry: supplier.industry || 'Not specified',
      country: supplier.country || 'Not specified',
      employees: supplier.employees || 0,
      website: supplier.website || '#',
      lastUpdated: supplier.last_updated || new Date().toISOString(),
      esgRisk: {
        environmental: riskData?.environmental || 'Unknown',
        social: riskData?.social || 'Unknown',
        governance: riskData?.governance || 'Unknown',
        overall: riskData?.overall || 'Unknown'
      },
      complianceStatus: {
        lksg: complianceData?.lksg || 'Unknown',
        cbam: complianceData?.cbam || 'Unknown',
        csdd: complianceData?.csdd || 'Unknown',
        csrd: complianceData?.csrd || 'Unknown',
        reach: complianceData?.reach || 'Unknown'
      }
    };
    
    console.log('Sending back formatted supplier:', formattedSupplier);
    
    return NextResponse.json({ data: formattedSupplier });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 