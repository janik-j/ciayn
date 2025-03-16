"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Plus,
  Globe,
  Building,
  MapPin,
  Users,
  AlertTriangle,
  X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SupplierDetail } from "@/components/supplier-detail"
import { NewsFeedAnalyzer } from "@/components/news-feed-analyzer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { CompanyLogo } from "@/components/company-logo"

// Define the supplier type
type Supplier = {
  id: string
  name: string
  industry: string
  country: string
  employees: number
  website: string
  lastUpdated: string
  esgRisk: {
    overall: string
  }
}


export function SupplierList({ initialData = [] }: { initialData?: Supplier[] }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshingIds, setRefreshingIds] = useState<string[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const router = useRouter()

  // Fetching suppliers from API
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/my-suppliers', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })
      
      if (response.ok) {
        const { data } = await response.json()
        setSuppliers(data)
      } else {
        console.error('Error fetching suppliers:', response.statusText)
        setSuppliers([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setSuppliers([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, []);

  // Fetch suppliers on mount and when dependencies change
  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Refresh a supplier's risk assessment - update using API
  const refreshSupplier = async (id: string) => {
    setRefreshingIds((prev) => [...prev, id])

    try {
      // Call our API endpoint
      const response = await fetch('/api/my-suppliers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        const { data } = await response.json()
        
        // Update the supplier in our local state
        setSuppliers((prev) =>
          prev.map((supplier) => {
            if (supplier.id === id) {
              return {
                ...supplier,
                lastUpdated: data.lastUpdated,
                esgRisk: data.esgRisk,
              }
            }
            return supplier
          }),
        )
      } else {
        console.error('Failed to refresh supplier')
      }
    } catch (error) {
      console.error('Error refreshing supplier:', error)
    } finally {
      setRefreshingIds((prev) => prev.filter((item) => item !== id))
    }
  }


  // View details of a supplier - now redirects to profile page
  const viewSupplierDetails = (supplier: Supplier) => {
    router.push(`/profile/${encodeURIComponent(supplier.name)}`);
  }

  // Close supplier details
  const closeSupplierDetails = () => {
    setSelectedSupplierId(null);
  }

  // Handle "Refresh All" button click
  const handleRefreshAll = useCallback(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ArrowUpDown />
          </Button>
          <Button onClick={handleRefreshAll} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh All
              </>
            )}
          </Button>
          <Link href="/profile/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : suppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">No supplier data available</h3>
            <p className="text-sm text-slate-500 mb-4">There was an error loading suppliers from the database</p>
            <Button onClick={fetchSuppliers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">No suppliers found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or add a new supplier</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CompanyLogo companyName={supplier.name} size={32} /> 
                    <div>
                      <h3 className="text-lg font-semibold">{supplier.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshSupplier(supplier.id)}
                      disabled={refreshingIds.includes(supplier.id)}
                    >
                      {refreshingIds.includes(supplier.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => viewSupplierDetails(supplier)}
                    >
                      View Profile
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mt-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">LkSG</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={"Coming soon"}>
                            {"Coming soon"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">CBAM</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={"Coming soon"}>
                            {"Coming soon"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">CSRD</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={"Coming soon"}>
                            {"Coming soon"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">REACH</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={"Coming soon"}>
                            {"Coming soon"}
                          </Badge>
                        </div>
                      </div>
                    </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
