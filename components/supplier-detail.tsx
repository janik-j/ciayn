"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw,
  Globe,
  Building,
  MapPin,
  Users,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { CompanyLogo } from "@/components/company-logo"

export function SupplierDetail({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [supplier, setSupplier] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSupplierData()
  }, [id])

  const fetchSupplierData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch from our specific supplier API endpoint
      const response = await fetch(`/api/my-suppliers/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch supplier: ${response.statusText}`)
      }

      const { data } = await response.json()
      
      if (data) {
        // Add default red flags and recommendations
        const enhancedSupplier = {
          ...data,
          redFlags: generateRedFlags(data),
          recommendations: generateRecommendations(data),
        }
        
        setSupplier(enhancedSupplier)
      } else {
        throw new Error('Supplier data not found')
      }
    } catch (error) {
      console.error('Error fetching supplier data:', error)
      setError('Failed to load supplier data')
      
      // Instead of mock data, create a generic error state
      setSupplier({
        id: id,
        name: "Data Loading Error",
        industry: "Not available",
        country: "Not available",
        employees: 0,
        website: "#",
        lastUpdated: "Never",
        esgRisk: {
          environmental: "Unknown",
          social: "Unknown",
          governance: "Unknown",
          overall: "Unknown"
        },
        redFlags: ["Connection error - unable to load supplier data"],
        complianceStatus: {
          lksg: "Unknown",
          cbam: "Unknown",
          csdd: "Unknown",
          csrd: "Unknown",
          reach: "Unknown"
        },
        recommendations: ["Check connection and try again", "Contact support if the issue persists"]
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate red flags based on supplier data
  const generateRedFlags = (supplier: any) => {
    const redFlags = []
    
    // Check if this is a new supplier with little data
    if (supplier.industry === 'Not specified' || 
        supplier.country === 'Not specified' || 
        supplier.employees === 0) {
      redFlags.push("Supplier data incomplete - basic company information missing")
    }
    
    // High ESG risk areas
    if (supplier.esgRisk.environmental === "High") {
      redFlags.push("High environmental risk detected")
    }
    if (supplier.esgRisk.social === "High") {
      redFlags.push("High social risk detected")
    }
    if (supplier.esgRisk.governance === "High") {
      redFlags.push("High governance risk detected")
    }
    
    // If all ESG risks are unknown
    if (supplier.esgRisk.environmental === "Unknown" && 
        supplier.esgRisk.social === "Unknown" && 
        supplier.esgRisk.governance === "Unknown") {
      redFlags.push("ESG risk assessment missing - request data from supplier")
    }
    
    // Non-compliant status for key regulations
    if (supplier.complianceStatus.lksg === "Non-Compliant") {
      redFlags.push("Non-compliant with LkSG requirements")
    }
    if (supplier.complianceStatus.csdd === "Non-Compliant") {
      redFlags.push("Non-compliant with CSDD requirements")
    }
    
    // Countries with higher risk
    const highRiskCountries = ["Bangladesh", "Myanmar", "Cambodia", "China"]
    if (highRiskCountries.includes(supplier.country)) {
      redFlags.push(`High-risk country: ${supplier.country}`)
    }
    
    // If no red flags were found, add a default one for incomplete data
    if (redFlags.length === 0 && 
        Object.values(supplier.complianceStatus).every(status => status === 'Unknown')) {
      redFlags.push("Compliance status unknown - assessment required")
    }
    
    return redFlags.length > 0 ? redFlags : ["No significant risks identified"];
  }
  
  // Generate recommendations based on supplier data
  const generateRecommendations = (supplier: any) => {
    const recommendations = []
    
    // Recommendations for incomplete data
    if (supplier.industry === 'Not specified' || 
        supplier.country === 'Not specified' || 
        supplier.employees === 0) {
      recommendations.push("Collect basic supplier information (industry, country, size)")
    }
    
    // Recommendations based on ESG risk
    if (supplier.esgRisk.environmental === "High" || supplier.esgRisk.environmental === "Medium") {
      recommendations.push("Conduct environmental compliance audit")
    }
    if (supplier.esgRisk.social === "High" || supplier.esgRisk.social === "Medium") {
      recommendations.push("Implement social compliance monitoring")
    }
    if (supplier.esgRisk.governance === "High" || supplier.esgRisk.governance === "Medium") {
      recommendations.push("Request governance documentation")
    }
    
    // If all ESG risks are unknown
    if (supplier.esgRisk.environmental === "Unknown" && 
        supplier.esgRisk.social === "Unknown" && 
        supplier.esgRisk.governance === "Unknown") {
      recommendations.push("Perform initial ESG risk assessment")
    }
    
    // Recommendations based on compliance status
    if (supplier.complianceStatus.lksg !== "Compliant") {
      recommendations.push("Perform LkSG compliance assessment")
    }
    if (supplier.complianceStatus.cbam === "Unknown") {
      recommendations.push("Request carbon emissions data for CBAM")
    }
    
    // For new suppliers with unknown compliance
    if (Object.values(supplier.complianceStatus).every(status => status === 'Unknown')) {
      recommendations.push("Request compliance self-assessment questionnaire")
      recommendations.push("Schedule initial supplier compliance screening")
    }
    
    return recommendations.length > 0 ? recommendations : ["Maintain current documentation and monitoring"];
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-emerald-500"
      case "Medium":
        return "bg-amber-500"
      case "High":
        return "bg-red-500"
      case "Unknown":
      default:
        return "bg-slate-300"
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Partially Compliant":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Non-Compliant":
        return "bg-red-100 text-red-800 border-red-200"
      case "Unknown":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getRiskProgress = (risk: string) => {
    switch (risk) {
      case "Low":
        return 33
      case "Medium":
        return 66
      case "High":
        return 100
      case "Unknown":
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/my-suppliers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{supplier.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <CompanyLogo companyName={supplier.name} size={48} />
              <div>
                <CardTitle>{supplier.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Building className="h-4 w-4" />
                    {supplier.industry}
                    <span className="mx-1">•</span>
                    <MapPin className="h-4 w-4" />
                    {supplier.country}
                    <span className="mx-1">•</span>
                    <Users className="h-4 w-4" />
                    {supplier.employees.toLocaleString()} employees
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Company Information Section */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="text-sm font-medium">{supplier.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="text-sm font-medium">{supplier.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Number of Employees</p>
                    <p className="text-sm font-medium">{supplier.employees.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {supplier.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="risk" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="risk">ESG Risk</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="risk" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Environmental</h3>
                      <Badge className={`${getRiskColor(supplier.esgRisk.environmental)} text-white`}>
                        {supplier.esgRisk.environmental}
                      </Badge>
                    </div>
                    <Progress value={getRiskProgress(supplier.esgRisk.environmental)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Social</h3>
                      <Badge className={`${getRiskColor(supplier.esgRisk.social)} text-white`}>
                        {supplier.esgRisk.social}
                      </Badge>
                    </div>
                    <Progress value={getRiskProgress(supplier.esgRisk.social)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Governance</h3>
                      <Badge className={`${getRiskColor(supplier.esgRisk.governance)} text-white`}>
                        {supplier.esgRisk.governance}
                      </Badge>
                    </div>
                    <Progress value={getRiskProgress(supplier.esgRisk.governance)} className="h-2" />
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Red Flags</h3>
                  <div className="space-y-2">
                    {supplier.redFlags.length > 0 ? (
                      supplier.redFlags.map((flag: string, index: number) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <AlertTitle className="ml-2 text-sm font-medium">Risk Identified</AlertTitle>
                          <AlertDescription className="ml-2 text-sm">{flag}</AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <AlertTitle className="ml-2 text-sm font-medium">No Risks Identified</AlertTitle>
                        <AlertDescription className="ml-2 text-sm">
                          No significant red flags have been identified for this supplier.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Supply Chain Due Diligence Act</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getComplianceColor(supplier.complianceStatus.lksg)}>
                          {supplier.complianceStatus.lksg}
                        </Badge>
                        {supplier.complianceStatus.lksg === "Compliant" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Carbon Border Adjustment Mechanism (CBAM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getComplianceColor(supplier.complianceStatus.cbam)}>
                          {supplier.complianceStatus.cbam}
                        </Badge>
                        {supplier.complianceStatus.cbam === "Compliant" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : supplier.complianceStatus.cbam === "Unknown" ? (
                          <FileText className="h-5 w-5 text-slate-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Corporate Sustainability Due Diligence (CSDD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getComplianceColor(supplier.complianceStatus.csdd)}>
                          {supplier.complianceStatus.csdd}
                        </Badge>
                        {supplier.complianceStatus.csdd === "Compliant" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : supplier.complianceStatus.csdd === "Unknown" ? (
                          <FileText className="h-5 w-5 text-slate-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Corporate Sustainability Reporting (CSRD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getComplianceColor(supplier.complianceStatus.csrd)}>
                          {supplier.complianceStatus.csrd}
                        </Badge>
                        {supplier.complianceStatus.csrd === "Compliant" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : supplier.complianceStatus.csrd === "Unknown" ? (
                          <FileText className="h-5 w-5 text-slate-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">REACH (Chemical Regulation)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getComplianceColor(supplier.complianceStatus.reach)}>
                          {supplier.complianceStatus.reach}
                        </Badge>
                        {supplier.complianceStatus.reach === "Compliant" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : supplier.complianceStatus.reach === "Unknown" ? (
                          <FileText className="h-5 w-5 text-slate-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="pt-4">
                <h3 className="text-sm font-medium mb-2">Recommended Actions</h3>
                <ul className="space-y-2">
                  {supplier.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-slate-50 rounded-md">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload relevant supplier documents for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <h3 className="text-sm font-medium mb-1">Upload Documents</h3>
                <p className="text-xs text-slate-500 mb-4">Drag and drop files or click to browse</p>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h4 className="text-xs font-medium text-slate-500 mb-2">Suggested Documents</h4>
              <ul className="space-y-2 w-full">
                <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span>Environmental Policy</span>
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </li>
                <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span>Human Rights Policy</span>
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </li>
                <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span>Carbon Emissions Report</span>
                  <Badge variant="outline" className="text-xs">
                    Recommended
                  </Badge>
                </li>
                <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span>REACH Documentation</span>
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </li>
              </ul>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Documents</CardTitle>
              <CardDescription>Upload optional supporting documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <h3 className="text-sm font-medium mb-1">Upload Optional Documents</h3>
                <p className="text-xs text-slate-500 mb-4">Add any additional supporting documentation</p>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
