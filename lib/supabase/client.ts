import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a single supabase client for client-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single instance of the Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true
      }
    });
  }
  return supabaseInstance;
};

// Export a singleton instance
export const supabase = getSupabaseClient();

export type SupplierData = {
  id?: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  esg_risk: {
    environmental: "Low" | "Medium" | "High";
    social: "Low" | "Medium" | "High";
    governance: "Low" | "Medium" | "High";
  };
  red_flags: string[];
  compliance_status: {
    lksg: "Compliant" | "Partially Compliant" | "Non-Compliant";
    cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  };
  recommendations: string[];
};

export type SearchSupplierParams = {
  name?: string;
  industry?: string;
  country?: string;
};

/**
 * Search for suppliers matching the given parameters
 */
export async function searchSuppliers(params: SearchSupplierParams): Promise<SupplierData[]> {
  try {
    let query = supabase.from('suppliers').select('*');
    
    if (params.name) {
      query = query.ilike('name', `%${params.name}%`);
    }
    
    if (params.industry) {
      query = query.eq('industry', params.industry);
    }
    
    if (params.country) {
      query = query.eq('country', params.country);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching suppliers:', error);
      return [];
    }
    
    return data as SupplierData[];
  } catch (error) {
    console.error('Unexpected error searching suppliers:', error);
    return [];
  }
}

/**
 * Get a single supplier by ID
 */
export async function getSupplierById(id: string): Promise<SupplierData | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching supplier:', error);
      return null;
    }
    
    return data as SupplierData;
  } catch (error) {
    console.error('Unexpected error fetching supplier:', error);
    return null;
  }
}

/**
 * Create a new supplier
 */
export async function createSupplier(supplier: Omit<SupplierData, 'id'>): Promise<SupplierData | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating supplier:', error);
      return null;
    }
    
    return data as SupplierData;
  } catch (error) {
    console.error('Unexpected error creating supplier:', error);
    return null;
  }
}

/**
 * Transform form data into the SupplierData structure
 */
export function transformFormToSupplierData(formData: {
  name: string;
  industry: string;
  country: string;
  employees: string;
  website: string;
}): Omit<SupplierData, 'id'> {
  // Log country info for debugging
  console.log("Transforming country:", formData.country);
  
  return {
    name: formData.name,
    industry: formData.industry,
    country: formData.country,
    employees: Number(formData.employees),
    website: formData.website,
    esg_risk: {
      environmental: "Medium",
      social: "Low",
      governance: "Medium"
    },
    red_flags: [],
    compliance_status: {
      lksg: "Partially Compliant",
      cbam: "Unknown",
      csdd: "Partially Compliant",
      csrd: "Non-Compliant",
      reach: "Partially Compliant"
    },
    recommendations: [
      "Complete all required documentation uploads",
      "Provide detailed environmental policy",
      "Submit human rights policy documentation"
    ]
  };
} 