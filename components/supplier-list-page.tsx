"use client"

import { SupplierList } from "@/components/supplier-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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

interface SuppliersListPageProps {
  initialSuppliers: Supplier[]
}

export function SupplierListPage({ initialSuppliers }: SuppliersListPageProps) {
  // Debug information
  console.log("SupplierListPage received initialSuppliers:", initialSuppliers);
  console.log("initialSuppliers length:", initialSuppliers?.length || 0);
  
  // Make sure we always pass an array to SupplierList
  const safeSuppliers = Array.isArray(initialSuppliers) ? initialSuppliers : [];
  
  return (
    <div className="space-y-6">
      <SupplierList initialData={safeSuppliers} />
    </div>
  )
} 