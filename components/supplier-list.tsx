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
    environmental: "Low" | "Medium" | "High"
    social: "Low" | "Medium" | "High"
    governance: "Low" | "Medium" | "High"
    overall: "Low" | "Medium" | "High"
  }
  complianceStatus: {
    lksg: "Compliant" | "Partially Compliant" | "Non-Compliant"
    cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
    csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
    csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
    reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
  }
}

export function SupplierList({ initialData = [] }: { initialData?: Supplier[] }) {
  // Ensure initialData is an array for safety
  const safeInitialData = Array.isArray(initialData) ? initialData : [];
  console.log("SupplierList received initialData:", initialData);
  console.log("initialData length:", safeInitialData.length);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(safeInitialData)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshingIds, setRefreshingIds] = useState<string[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const router = useRouter()

  // Fetching suppliers from API
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true)

    try {
      // If we have initial data, use that instead of making API call
      if (safeInitialData.length > 0) {
        setSuppliers(safeInitialData)
        setIsLoading(false)
        return
      }
      
      // Try to fetch from our API endpoint
      const response = await fetch('/api/my-suppliers')
      
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
  }, [safeInitialData]);

  // Make sure suppliers state is updated when initialData changes
  useEffect(() => {
    console.log("SupplierList useEffect running with initialData:", safeInitialData);
    
    // Always set the suppliers from initialData on component mount
    if (safeInitialData.length > 0) {
      console.log("Setting suppliers from initialData (useEffect)");
      setSuppliers(safeInitialData);
      setIsLoading(false);
    } else {
      console.log("No initial data, fetching from API (useEffect)");
      fetchSuppliers();
    }
  }, [safeInitialData, fetchSuppliers]);

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
      // If we have initial data, simply use that data again
      if (safeInitialData.length > 0) {
        // Find the supplier in the initial data
        const supplierToRefresh = safeInitialData.find(s => s.id === id);
        if (supplierToRefresh) {
          // Just update the timestamp to show something happened
          setSuppliers((prev) =>
            prev.map((supplier) => {
              if (supplier.id === id) {
                return {
                  ...supplier,
                  lastUpdated: new Date().toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                };
              }
              return supplier;
            })
          );
        }
        setRefreshingIds((prev) => prev.filter((i) => i !== id));
        return;
      }
      
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

  // Get color for risk level
  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return "bg-emerald-500 text-white"
      case "Medium":
        return "bg-amber-500 text-white"
      case "High":
        return "bg-red-500 text-white"
      default:
        return "bg-slate-300 text-white"
    }
  }

  const getOverallRiskBadge = (risk: "Low" | "Medium" | "High") => {
    return (
      <Badge className={getRiskColor(risk)}>
        {risk} Risk
      </Badge>
    )
  }

  // Get color for compliance status
  const getComplianceColor = (status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown") => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Partially Compliant":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Non-Compliant":
        return "bg-red-100 text-red-800 border-red-200"
      case "Unknown":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
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
    console.log("Refresh All clicked, initialData length:", safeInitialData.length);
    
    // If we have initial data, simply reset to that data
    if (safeInitialData.length > 0) {
      console.log("Using initialData to refresh");
      setSuppliers(safeInitialData);
      return;
    }
    
    // Otherwise try API call
    console.log("No initialData, calling fetchSuppliers");
    fetchSuppliers();
  }, [safeInitialData, fetchSuppliers]);

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
              Add Profile
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : safeInitialData.length > 0 && suppliers.length === 0 ? (
        // This shouldn't normally happen - if we have initialData but suppliers is empty
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">Suppliers not loaded correctly</h3>
            <p className="text-sm text-slate-500 mb-4">There was an issue displaying your suppliers</p>
            <Button onClick={() => setSuppliers(safeInitialData)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Suppliers
            </Button>
          </CardContent>
        </Card>
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
            <Card key={supplier.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-2 md:w-1 flex-shrink-0 ${getRiskColor(supplier.esgRisk.overall).split(' ')[0]}`} />
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{supplier.name}</h3>
                          <Badge className={getRiskColor(supplier.esgRisk.overall)}>
                            {supplier.esgRisk.overall} Risk
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />
                            <span>{supplier.industry}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{supplier.country}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{supplier.employees.toLocaleString()} employees</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            <a
                              href={supplier.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              Website
                            </a>
                          </div>
                          <div className="flex items-center gap-1 col-span-2 md:col-span-1">
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Updated: {supplier.lastUpdated}</span>
                          </div>
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
                        <h4 className="text-xs font-medium text-slate-500">Environmental</h4>
                        <Badge className={getRiskColor(supplier.esgRisk.environmental)}>
                          {supplier.esgRisk.environmental}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">Social</h4>
                        <Badge className={getRiskColor(supplier.esgRisk.social)}>{supplier.esgRisk.social}</Badge>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">Governance</h4>
                        <Badge className={getRiskColor(supplier.esgRisk.governance)}>
                          {supplier.esgRisk.governance}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">LkSG</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={getComplianceColor(supplier.complianceStatus.lksg)}>
                            {supplier.complianceStatus.lksg}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">CBAM</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={getComplianceColor(supplier.complianceStatus.cbam)}>
                            {supplier.complianceStatus.cbam}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">CSDD</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={getComplianceColor(supplier.complianceStatus.csdd)}>
                            {supplier.complianceStatus.csdd}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">CSRD</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={getComplianceColor(supplier.complianceStatus.csrd)}>
                            {supplier.complianceStatus.csrd}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-medium text-slate-500">REACH</h4>
                        <div className="flex items-center gap-1">
                          <Badge className={getComplianceColor(supplier.complianceStatus.reach)}>
                            {supplier.complianceStatus.reach}
                          </Badge>
                        </div>
                      </div>
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

