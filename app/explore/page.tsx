import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ListFilter, Database } from "lucide-react"
import { ExploreSearch } from "@/components/explore-search"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Supplier Risk Analysis</h1>
          <div className="flex gap-3">
            <Link href="/my-suppliers" passHref>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" />
                View All Suppliers
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center w-full max-w-6xl mx-auto my-12">
          <div className="w-full md:w-4/5 lg:w-5/6 shadow-lg rounded-lg overflow-hidden">
            <ExploreSearch />
          </div>
        </div>
      </main>
    </div>
  )
}