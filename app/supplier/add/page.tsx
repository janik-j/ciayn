"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { AddSupplierForm } from "@/components/add-supplier-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddSupplierPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialName = searchParams.get("name") || ""

  const handleSubmit = (newSupplier: any) => {
    // After adding, redirect to the new supplier page
    router.push(`/supplier/${encodeURIComponent(newSupplier.name)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href="/suppliers" passHref>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Suppliers
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">Add New Supplier</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <AddSupplierForm 
            initialName={initialName} 
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  )
} 