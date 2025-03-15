"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import Link from "next/link"

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

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshingIds, setRefreshingIds] = useState<string[]>([])

  // Simulate fetching suppliers on component mount
  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Simulate fetching suppliers
  const fetchSuppliers = () => {
    setIsLoading(true)

    // Simulate API call with timeout
    setTimeout(() => {
      setSuppliers([
        {
          id: "1",
          name: "Acme Manufacturing",
          industry: "Manufacturing",
          country: "United States",
          employees: 1250,
          website: "https://acme-example.com",
          lastUpdated: "2024-03-10",
          esgRisk: {
            environmental: "Medium",
            social: "Low",
            governance: "Medium",
            overall: "Medium",
          },
          complianceStatus: {
            lksg: "Partially Compliant",
            cbam: "Unknown",
            csdd: "Partially Compliant",
            csrd: "Non-Compliant",
            reach: "Partially Compliant",
          },
        },
        {
          id: "2",
          name: "EcoTech Solutions",
          industry: "Technology",
          country: "Germany",
          employees: 850,
          website: "https://ecotech-example.de",
          lastUpdated: "2024-03-12",
          esgRisk: {
            environmental: "Low",
            social: "Low",
            governance: "Low",
            overall: "Low",
          },
          complianceStatus: {
            lksg: "Compliant",
            cbam: "Compliant",
            csdd: "Compliant",
            csrd: "Compliant",
            reach: "Compliant",
          },
        },
        {
          id: "3",
          name: "Global Textiles Ltd",
          industry: "Textiles",
          country: "Bangladesh",
          employees: 3500,
          website: "https://globaltextiles-example.com",
          lastUpdated: "2024-03-05",
          esgRisk: {
            environmental: "Medium",
            social: "High",
            governance: "Medium",
            overall: "High",
          },
          complianceStatus: {
            lksg: "Non-Compliant",
            cbam: "Partially Compliant",
            csdd: "Non-Compliant",
            csrd: "Non-Compliant",
            reach: "Unknown",
          },
        },
        {
          id: "4",
          name: "Nordic Timber",
          industry: "Forestry",
          country: "Sweden",
          employees: 620,
          website: "https://nordictimber-example.se",
          lastUpdated: "2024-03-08",
          esgRisk: {
            environmental: "Low",
            social: "Low",
            governance: "Medium",
            overall: "Low",
          },
          complianceStatus: {
            lksg: "Compliant",
            cbam: "Compliant",
            csdd: "Compliant",
            csrd: "Partially Compliant",
            reach: "Compliant",
          },
        },
        {
          id: "5",
          name: "Sunshine Electronics",
          industry: "Electronics",
          country: "China",
          employees: 5200,
          website: "https://sunshine-example.cn",
          lastUpdated: "2024-03-01",
          esgRisk: {
            environmental: "High",
            social: "Medium",
            governance: "Medium",
            overall: "High",
          },
          complianceStatus: {
            lksg: "Partially Compliant",
            cbam: "Non-Compliant",
            csdd: "Partially Compliant",
            csrd: "Unknown",
            reach: "Non-Compliant",
          },
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  // Simulate refreshing a single supplier's risk assessment
  const refreshSupplier = (id: string) => {
    setRefreshingIds((prev) => [...prev, id])

    // Simulate API call with timeout
    setTimeout(() => {
      setSuppliers((prev) =>
        prev.map((supplier) => {
          if (supplier.id === id) {
            // Randomly update the risk levels to simulate real-time changes
            const riskLevels: Array<"Low" | "Medium" | "High"> = ["Low", "Medium", "High"]
            const randomRisk = () => riskLevels[Math.floor(Math.random() * riskLevels.length)]

            const environmental = randomRisk()
            const social = randomRisk()
            const governance = randomRisk()

            // Determine overall risk (highest of the three)
            let overall: "Low" | "Medium" | "High" = "Low"
            if (environmental === "High" || social === "High" || governance === "High") {
              overall = "High"
            } else if (environmental === "Medium" || social === "Medium" || governance === "Medium") {
              overall = "Medium"
            }

            return {
              ...supplier,
              lastUpdated: new Date().toISOString().split("T")[0],
              esgRisk: {
                environmental,
                social,
                governance,
                overall,
              },
            }
          }
          return supplier
        }),
      )
      setRefreshingIds((prev) => prev.filter((item) => item !== id))
    }, 1500)
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
          <Button onClick={fetchSuppliers} disabled={isLoading}>
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
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
                  <div className={`w-2 md:w-1 flex-shrink-0 ${getRiskColor(supplier.esgRisk.overall)}`} />
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
                        <Link href={`/supplier/${supplier.id}`} passHref>
                          <Button size="sm">
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
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

