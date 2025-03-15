"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, MapPin, Users, Globe, Upload, FileText, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createSupplier, transformFormToSupplierData } from "@/lib/supabase/client"

interface AddSupplierFormProps {
  initialName: string
  onSubmit: (data: any) => void
}

export function AddSupplierForm({ initialName, onSubmit }: AddSupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialName,
    industry: "",
    country: "",
    employees: "",
    website: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; required: boolean }[]>([])
  const [optionalFiles, setOptionalFiles] = useState<{ name: string; type: string }[]>([])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Transform form data and create supplier in Supabase
      const supplierData = transformFormToSupplierData(formData);
      
      // Adjust risk assessment based on uploaded files
      if (uploadedFiles.length < 2) {
        supplierData.red_flags.push("Limited documentation provided");
      }
      
      if (uploadedFiles.some((f) => f.name.includes("Human Rights"))) {
        supplierData.compliance_status.lksg = "Compliant";
      }
      
      if (uploadedFiles.some((f) => f.name.includes("Carbon"))) {
        supplierData.compliance_status.cbam = "Compliant";
      }
      
      if (uploadedFiles.some((f) => f.name.includes("REACH"))) {
        supplierData.compliance_status.reach = "Compliant";
      }
      
      const newSupplier = await createSupplier(supplierData);
      
      if (newSupplier) {
        // Transform to match the expected format in parent component
        const companyData = {
          id: newSupplier.id,
          name: newSupplier.name,
          industry: newSupplier.industry,
          country: newSupplier.country,
          employees: newSupplier.employees,
          website: newSupplier.website,
          esgRisk: newSupplier.esg_risk,
          redFlags: newSupplier.red_flags,
          complianceStatus: newSupplier.compliance_status,
          recommendations: newSupplier.recommendations
        };
        
        onSubmit(companyData);
      } else {
        // Handle error case
        console.error("Failed to create supplier");
        // You could add error UI feedback here
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      // You could add error UI feedback here
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = (isRequired: boolean) => {
    // Simulate file upload
    const fileTypes = [
      { name: "Environmental Policy.pdf", type: "application/pdf", required: true },
      { name: "Human Rights Policy.docx", type: "application/docx", required: true },
      { name: "Carbon Emissions Report.xlsx", type: "application/xlsx", required: false },
      { name: "REACH Documentation.pdf", type: "application/pdf", required: true },
    ]

    const randomFile = fileTypes.find(
      (f) =>
        f.required === isRequired &&
        !uploadedFiles.some((uf) => uf.name === f.name) &&
        !optionalFiles.some((of) => of.name === f.name),
    )

    if (randomFile) {
      if (isRequired) {
        setUploadedFiles((prev) => [...prev, randomFile])
      } else {
        setOptionalFiles((prev) => [...prev, randomFile])
      }
    }
  }

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.industry !== "" &&
      formData.country !== "" &&
      formData.employees !== "" &&
      formData.website !== ""
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Supplier</CardTitle>
        <CardDescription>Enter supplier details and upload required documentation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  <Building className="inline-block h-4 w-4 mr-1" />
                  Branche
                </Label>
                <Select value={formData.industry} onValueChange={(value) => updateField("industry", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">
                  <MapPin className="inline-block h-4 w-4 mr-1" />
                  Land
                </Label>
                <Select value={formData.country} onValueChange={(value) => updateField("country", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="italy">Italy</SelectItem>
                    <SelectItem value="spain">Spain</SelectItem>
                    <SelectItem value="united states">United States</SelectItem>
                    <SelectItem value="china">China</SelectItem>
                    <SelectItem value="japan">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employees">
                  <Users className="inline-block h-4 w-4 mr-1" />
                  Anzahl Mitarbeiter
                </Label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="Enter number of employees"
                  value={formData.employees}
                  onChange={(e) => updateField("employees", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="inline-block h-4 w-4 mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="Enter website URL"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="required" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="required">Required Documents</TabsTrigger>
              <TabsTrigger value="optional">Optional Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="required" className="space-y-4 pt-4">
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <h3 className="text-sm font-medium mb-1">Upload Required Documents</h3>
                <p className="text-xs text-slate-500 mb-4">Drag and drop files or click to browse</p>
                <Button variant="outline" size="sm" type="button" onClick={() => handleFileUpload(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-slate-500">Uploaded Documents</h4>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{file.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.required ? "Required" : "Optional"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-slate-500">Required Documents</h4>
                <ul className="space-y-2">
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
                    <span>REACH Documentation</span>
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="optional" className="space-y-4 pt-4">
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <h3 className="text-sm font-medium mb-1">Upload Optional Documents</h3>
                <p className="text-xs text-slate-500 mb-4">Add any additional supporting documentation</p>
                <Button variant="outline" size="sm" type="button" onClick={() => handleFileUpload(false)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>

              {optionalFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-slate-500">Uploaded Optional Documents</h4>
                  <ul className="space-y-2">
                    {optionalFiles.map((file, index) => (
                      <li key={index} className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{file.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Optional
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-slate-500">Suggested Optional Documents</h4>
                <ul className="space-y-2">
                  <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>Carbon Emissions Report</span>
                    <Badge variant="outline" className="text-xs">
                      Recommended
                    </Badge>
                  </li>
                  <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>Sustainability Report</span>
                    <Badge variant="outline" className="text-xs">
                      Recommended
                    </Badge>
                  </li>
                  <li className="text-xs flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>Supplier Code of Conduct</span>
                    <Badge variant="outline" className="text-xs">
                      Recommended
                    </Badge>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={!isFormValid() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Supplier"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

