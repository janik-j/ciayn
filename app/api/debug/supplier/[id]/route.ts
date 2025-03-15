import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get raw supplier data
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    // Get raw risk data
    const { data: riskData, error: riskError } = await supabase
      .from('supplier_esg_risk')
      .select('*')
      .eq('supplier_id', id)
      .single();
    
    // Get raw compliance data
    const { data: complianceData, error: complianceError } = await supabase
      .from('supplier_compliance')
      .select('*')
      .eq('supplier_id', id)
      .single();
    
    // Return all data and errors for debugging
    return NextResponse.json({
      supplier: {
        data: supplier,
        error: supplierError ? {
          code: supplierError.code,
          message: supplierError.message,
          details: supplierError.details
        } : null
      },
      esgRisk: {
        data: riskData,
        error: riskError ? {
          code: riskError.code,
          message: riskError.message,
          details: riskError.details
        } : null
      },
      complianceStatus: {
        data: complianceData,
        error: complianceError ? {
          code: complianceError.code,
          message: complianceError.message,
          details: complianceError.details
        } : null
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    );
  }
} 