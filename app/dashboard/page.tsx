import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ListFilter, Database } from "lucide-react"
import { DashboardSearch } from "@/components/dashboard-search"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Supplier Risk Analysis</h1>
          <div className="flex gap-3">
            <Link href="/suppliers" passHref>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" />
                View All Suppliers
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full md:col-span-2">
            <DashboardSearch />
          </div>
          <div className="col-span-full md:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link href="/suppliers" passHref className="block w-full">
                  <Button className="w-full justify-start">
                    <ListFilter className="mr-2 h-4 w-4" />
                    Browse All Suppliers
                  </Button>
                </Link>
                {/* Add more quick actions here if needed */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}