"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AddSupplierForm } from "./add-supplier-form"
import { searchSuppliers, SupplierData } from "@/lib/supabase/client"

interface CompanySearchProps {
  onCompanyFound: (companyData: any) => void
}

export function CompanySearch({ onCompanyFound }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setNotFound(false)
    setShowAddForm(false)

    try {
      // Search for supplier in Supabase
      const suppliers = await searchSuppliers({ name: searchTerm });
      
      if (suppliers && suppliers.length > 0) {
        const supplier = suppliers[0];
        
        // Transform Supabase data format to match component expectations
        const companyData = {
          id: supplier.id,
          name: supplier.name,
          industry: supplier.industry,
          country: supplier.country,
          employees: supplier.employees,
          website: supplier.website,
          esgRisk: supplier.esg_risk,
          redFlags: supplier.red_flags,
          complianceStatus: supplier.compliance_status,
          recommendations: supplier.recommendations
        };
        
        onCompanyFound(companyData);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Unexpected error during search:', err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Risk Assessment</CardTitle>
          <CardDescription>Search for a supplier to analyze compliance and ESG risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Enter supplier name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {notFound && !showAddForm && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Supplier Not Found</AlertTitle>
                  <AlertDescription>
                    We couldn't find "{searchTerm}" in our database. Would you like to add this supplier?
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                  <Button onClick={() => setShowAddForm(true)}>Add New Supplier</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showAddForm && <AddSupplierForm initialName={searchTerm} onSubmit={onCompanyFound} />}
    </div>
  )
}

