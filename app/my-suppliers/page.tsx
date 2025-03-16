'use client'

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase/client"
import { SupplierListPage } from "@/components/supplier-list-page"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

// Define interfaces for database types
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

interface DbSupplier {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  last_updated: string;
}

// Type for the formatted supplier list used in the supplier-list-page component
type Supplier = {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  lastUpdated: string;
  esgRisk: {
    environmental: "Low" | "Medium" | "High";
    social: "Low" | "Medium" | "High";
    governance: "Low" | "Medium" | "High";
    overall: "Low" | "Medium" | "High";
  };
  complianceStatus: {
    lksg: "Compliant" | "Partially Compliant" | "Non-Compliant";
    cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  };
}

// Convert to client component
export default function MySuppliersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/my-suppliers')
    }
  }, [user, loading, router])

  // Function to fetch suppliers data
  const fetchSuppliers = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("Fetching suppliers for user:", user.id)
      
      // Check if we can reach Supabase
      try {
        const { data: healthCheck, error: healthCheckError } = await supabase
          .from('user_supplier_lists')
          .select('count')
          .limit(1)
        
        if (healthCheckError) {
          console.error("Supabase health check failed:", healthCheckError)
          setError(`Supabase connection issue: ${healthCheckError.message}. Please check your network and Supabase configuration.`)
          setIsLoading(false)
          return
        }
        
        console.log("Supabase health check passed:", healthCheck)
      } catch (healthErr) {
        console.error("Unexpected error during health check:", healthErr)
      }
      
      // Continue with fetching associations
      console.log("Table name being used:", 'user_supplier_lists')
      console.log("User ID being used for query:", user.id, "Type:", typeof user.id)
      
      // Fetch the user's associated suppliers from the association table
      const { data: associations, error: associationsError } = await supabase
        .from('user_supplier_lists')
        .select('supplier')
        .eq('user', user.id)
      
      if (associationsError) {
        console.error("Error fetching associations:", associationsError)
        setError(`Error fetching associations: ${associationsError.message}`)
        setSuppliers([])
        setIsLoading(false)
        return
      }
      
      if (!associations || associations.length === 0) {
        console.log("No supplier associations found for user:", user.id)
        setSuppliers([])
        setIsLoading(false)
        return
      }
      
      // Get the supplier IDs from the associations
      const supplierIds = associations.map(assoc => assoc.supplier)
      console.log("Found supplier IDs:", supplierIds)
      
      // Fetch only the suppliers that are associated with the user
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .in('id', supplierIds)
  
      if (suppliersError) {
        console.error("Error fetching suppliers:", suppliersError)
        setError(`Error fetching suppliers: ${suppliersError.message}`)
        setSuppliers([])
        setIsLoading(false)
        return
      }
      
      if (!suppliersData || suppliersData.length === 0) {
        console.log("No suppliers found with IDs:", supplierIds)
        setSuppliers([])
        setIsLoading(false)
        return
      }
      
      console.log("Fetched suppliers:", suppliersData)
      
      // Create a simple formatted supplier list without additional data for now
      const simpleSuppliers = suppliersData.map(supplier => {
        // Format date safely
        let lastUpdated = "Unknown date"
        try {
          if (supplier.last_updated) {
            lastUpdated = new Date(supplier.last_updated).toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          }
        } catch (err) {
          console.error("Error formatting date for supplier", supplier.id, err)
        }
        
        // Ensure all required fields have values
        return {
          id: supplier.id || `unknown-${Math.random().toString(36).substring(2, 9)}`,
          name: supplier.name || "Unknown Supplier",
          industry: supplier.industry || "Unknown",
          country: supplier.country || "Unknown",
          employees: typeof supplier.employees === 'number' ? supplier.employees : 0,
          website: supplier.website || "#",
          lastUpdated,
          esgRisk: {
            environmental: "Low" as "Low" | "Medium" | "High",
            social: "Low" as "Low" | "Medium" | "High",
            governance: "Low" as "Low" | "Medium" | "High",
            overall: "Low" as "Low" | "Medium" | "High"
          },
          complianceStatus: {
            lksg: "Non-Compliant" as "Compliant" | "Partially Compliant" | "Non-Compliant",
            cbam: "Unknown" as "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown",
            csdd: "Unknown" as "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown",
            csrd: "Unknown" as "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown",
            reach: "Unknown" as "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
          }
        }
      })
      
      console.log("Formatted suppliers:", simpleSuppliers)
      setSuppliers(simpleSuppliers)
    } catch (error) {
      console.error("Unexpected error fetching suppliers:", error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      setSuppliers([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Fetch suppliers data when user is available
  useEffect(() => {
    if (user) {
      fetchSuppliers()
    }
  }, [user, fetchSuppliers])
  
  // Don't render anything while loading or if not logged in
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">My Suppliers</h1>
          </div>
          <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-slate-500">Please wait while we load your suppliers.</p>
          </div>
        </main>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">My Suppliers</h1>
          </div>
          <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-2">Error Loading Suppliers</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <button 
              onClick={fetchSuppliers}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }
  
  // Empty state when no suppliers are found
  if (!isLoading && suppliers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">My Suppliers</h1>
          </div>
          <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-2">No suppliers yet</h2>
            <p className="text-slate-500">You haven't added any suppliers to your list.</p>
          </div>
        </main>
      </div>
    )
  }

  // Main content with suppliers
  // Log supplier information for debugging
  console.log("About to render SupplierListPage with suppliers:", suppliers);
  console.log("Suppliers array length:", suppliers.length);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">My Suppliers</h1>
        </div>
        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-slate-500">Please wait while we load your suppliers.</p>
          </div>
        ) : (
          <SupplierListPage initialSuppliers={suppliers} />
        )}
      </main>
    </div>
  )
}

