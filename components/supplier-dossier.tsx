"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, AlertTriangle, CheckCircle, FileText, Globe, Building, MapPin, Users } from "lucide-react"
import { SupplierSearchForm } from "./supplier-search-form"

export default function SupplierDossier() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<null | {
    name: string
    industry: string
    country: string
    employees: number
    website: string
    esgRisk: {
      environmental: "Low" | "Medium" | "High"
      social: "Low" | "Medium" | "High"
      governance: "Low" | "Medium" | "High"
    }
    redFlags: string[]
    complianceStatus: {
      lksg: "Compliant" | "Partially Compliant" | "Non-Compliant"
      cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
      csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
      csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
      reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown"
    }
    recommendations: string[]
  }>(null)

  const handleSubmit = (formData: {
    name: string
    industry: string
    country: string
    employees: string
    website: string
  }) => {
    setIsLoading(true)

    // Simulate API call with timeout
    setTimeout(() => {
      setResults({
        name: formData.name,
        industry: formData.industry,
        country: formData.country,
        employees: isNaN(Number(formData.employees)) ? 0 : Number(formData.employees),
        website: formData.website,
        esgRisk: {
          environmental: "Medium",
          social: "Low",
          governance: "Medium",
        },
        redFlags: [
          "Fined for pollution violation (Brazil, Jan 2024)",
          "No human rights policy found online",
          "Limited transparency in supply chain documentation",
          "REACH compliance documentation incomplete",
        ],
        complianceStatus: {
          lksg: "Partially Compliant",
          cbam: "Unknown",
          csdd: "Partially Compliant",
          csrd: "Non-Compliant",
          reach: "Partially Compliant",
        },
        recommendations: [
          "Request updated Environmental Policy and Human Rights Policy",
          "Conduct supplier audit focused on environmental compliance",
          "Require carbon emissions data for CBAM compliance assessment",
          "Request CSRD reporting documentation",
          "Verify REACH registration for all chemical substances",
        ],
      })
      setIsLoading(false)
    }, 1500)
  }

  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return "bg-emerald-500"
      case "Medium":
        return "bg-amber-500"
      case "High":
        return "bg-red-500"
      default:
        return "bg-slate-300"
    }
  }

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

  const getRiskProgress = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return 33
      case "Medium":
        return 66
      case "High":
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      <SupplierSearchForm onSubmit={handleSubmit} isLoading={isLoading} />

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Supplier Dossier: {results.name}</CardTitle>
              <CardDescription>Compliance and ESG risk assessment based on web search results</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Company Information Section */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Branche</p>
                      <p className="text-sm font-medium">{results.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Land</p>
                      <p className="text-sm font-medium">{results.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Anzahl Mitarbeiter</p>
                      <p className="text-sm font-medium">{results.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Website</p>
                      <a
                        href={results.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        {results.website}
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
                        <Badge className={`${getRiskColor(results.esgRisk.environmental)} text-white`}>
                          {results.esgRisk.environmental}
                        </Badge>
                      </div>
                      <Progress value={getRiskProgress(results.esgRisk.environmental)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Social</h3>
                        <Badge className={`${getRiskColor(results.esgRisk.social)} text-white`}>
                          {results.esgRisk.social}
                        </Badge>
                      </div>
                      <Progress value={getRiskProgress(results.esgRisk.social)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Governance</h3>
                        <Badge className={`${getRiskColor(results.esgRisk.governance)} text-white`}>
                          {results.esgRisk.governance}
                        </Badge>
                      </div>
                      <Progress value={getRiskProgress(results.esgRisk.governance)} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Red Flags</h3>
                    <div className="space-y-2">
                      {results.redFlags.map((flag, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <AlertTitle className="ml-2 text-sm font-medium">Risk Identified</AlertTitle>
                          <AlertDescription className="ml-2 text-sm">{flag}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">German Supply Chain Act (LkSG)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge className={getComplianceColor(results.complianceStatus.lksg)}>
                            {results.complianceStatus.lksg}
                          </Badge>
                          {results.complianceStatus.lksg === "Compliant" ? (
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
                          <Badge className={getComplianceColor(results.complianceStatus.cbam)}>
                            {results.complianceStatus.cbam}
                          </Badge>
                          {results.complianceStatus.cbam === "Compliant" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : results.complianceStatus.cbam === "Unknown" ? (
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
                          <Badge className={getComplianceColor(results.complianceStatus.csdd)}>
                            {results.complianceStatus.csdd}
                          </Badge>
                          {results.complianceStatus.csdd === "Compliant" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : results.complianceStatus.csdd === "Unknown" ? (
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
                          <Badge className={getComplianceColor(results.complianceStatus.csrd)}>
                            {results.complianceStatus.csrd}
                          </Badge>
                          {results.complianceStatus.csrd === "Compliant" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : results.complianceStatus.csrd === "Unknown" ? (
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
                          <Badge className={getComplianceColor(results.complianceStatus.reach)}>
                            {results.complianceStatus.reach}
                          </Badge>
                          {results.complianceStatus.reach === "Compliant" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : results.complianceStatus.reach === "Unknown" ? (
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
                    {results.recommendations.map((recommendation, index) => (
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
      )}
    </div>
  )
}

