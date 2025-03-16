import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// GET all suppliers with their risk and compliance data
export async function GET(request: Request) {
  try {
    console.log('Attempting to fetch suppliers...');
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a new Supabase client with the user's token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Get the user's session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    console.log('Fetching suppliers for user:', userId);

    // Get the supplier IDs from user_supplier_lists
    const { data: lists, error: listsError } = await supabaseClient
      .from('user_supplier_lists')
      .select(`
        id,
        supplier
      `)
      .eq('user', userId);

    if (listsError) {
      console.error('Error fetching user supplier lists:', listsError);
      return NextResponse.json({ 
        error: 'Failed to fetch user supplier lists',
        details: listsError.message
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    if (!lists || lists.length === 0) {
      console.log('No supplier lists found for user');
      return NextResponse.json({ data: [] }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    const supplierIds = lists.map(list => list.supplier);
    console.log('Found supplier IDs:', supplierIds);

    // Fetch the suppliers with all their data
    const { data: suppliers, error: suppliersError } = await supabaseClient
      .from('suppliers')
      .select(`
        id,
        name,
        industry,
        country,
        employees,
        website,
        created_at,
        esg_risk,
        red_flags,
        compliance_status,
        recommendations
      `)
      .in('id', supplierIds);
    
    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError);
      return NextResponse.json({ 
        error: suppliersError.message,
        details: suppliersError
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    if (!suppliers || suppliers.length === 0) {
      console.log('No suppliers found in database');
      return NextResponse.json({ data: [] }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    console.log(`Found ${suppliers.length} suppliers`);

    // Format the suppliers data
    const formattedSuppliers = suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      industry: supplier.industry,
      country: supplier.country,
      employees: supplier.employees,
      website: supplier.website,
      lastUpdated: supplier.created_at,
      esgRisk: supplier.esg_risk || {
        environmental: 'Low',
        social: 'Low',
        governance: 'Low',
        overall: 'Low'
      },
      complianceStatus: supplier.compliance_status || {
        lksg: 'Unknown',
        cbam: 'Unknown',
        csdd: 'Unknown',
        csrd: 'Unknown',
        reach: 'Unknown'
      },
      redFlags: supplier.red_flags || [],
      recommendations: supplier.recommendations || []
    }));
    
    console.log('Successfully formatted suppliers data');
    return NextResponse.json({ data: formattedSuppliers }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Unexpected API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
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

    // Update the supplier with new ESG risk values
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({
        created_at: now,
        esg_risk: {
          environmental: 'Low',
          social: 'Low',
          governance: 'Low',
          overall: 'Low'
        }
      })
      .eq('id', id);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      data: {
        id,
        lastUpdated: now,
        esgRisk: {
          environmental: 'Low',
          social: 'Low',
          governance: 'Low',
          overall: 'Low'
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