"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Building, MapPin, Users, Globe, ChevronRight, Loader2 } from "lucide-react"

interface SupplierFormData {
  name: string
  industry: string
  country: string
  employees: string
  website: string
}

interface SupplierSearchFormProps {
  onSubmit: (data: SupplierFormData) => void
  isLoading: boolean
}

export function SupplierSearchForm({ onSubmit, isLoading }: SupplierSearchFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    industry: "",
    country: "",
    employees: "",
    website: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = (field: keyof SupplierFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0
      case 2:
        return formData.industry && formData.country
      case 3:
        return formData.employees && formData.website
      default:
        return false
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Risk Assessment</CardTitle>
        <CardDescription>Enter supplier information to analyze compliance and ESG risks</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basic Information */}
          <div className={`space-y-4 transition-opacity duration-200 ${step !== 1 ? "hidden" : ""}`}>
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="name"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)} disabled={!canProceed()}>
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step 2: Industry and Location */}
          <div className={`space-y-4 transition-opacity duration-200 ${step !== 2 ? "hidden" : ""}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">
                  <Building className="inline-block h-4 w-4 mr-1" />
                  Branche
                </Label>
                <Select value={formData.industry} onValueChange={(value) => updateField("industry", value)}>
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
                <Select value={formData.country} onValueChange={(value) => updateField("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="italy">Italy</SelectItem>
                    <SelectItem value="spain">Spain</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)} disabled={!canProceed()}>
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step 3: Additional Details */}
          <div className={`space-y-4 transition-opacity duration-200 ${step !== 3 ? "hidden" : ""}`}>
            <div className="grid gap-4 md:grid-cols-2">
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
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" disabled={!canProceed() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  i === step ? "bg-primary" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

