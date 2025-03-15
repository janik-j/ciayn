import SupplierDossier from "@/components/supplier-dossier"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ComplianceOverview } from "@/components/compliance-overview"
import Link from "next/link"
import { ListFilter } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Supplier Risk Analysis</h1>
          <Link href="/suppliers" passHref>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              View All Suppliers
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <ComplianceOverview />
        </div>

        <SupplierDossier />
      </main>
    </div>
  )
}

