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
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Link href="/supplier/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>
      
      <SupplierList initialData={initialSuppliers} />
    </div>
  )
} 