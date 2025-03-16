"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Plus } from "lucide-react"
import { searchSuppliers } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CompanyLogo } from "@/components/company-logo"
import { Badge } from "@/components/ui/badge"

export function ExploreSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)

    try {
      // Search for supplier in Supabase
      const suppliers = await searchSuppliers({ name: searchTerm });
      
      if (suppliers && suppliers.length > 0) {
        // Supplier exists, redirect to the profile page
        const supplier = suppliers[0];
        router.push(`/profile/${encodeURIComponent(supplier.name)}`);
      } else {
        // Supplier doesn't exist, redirect to dedicated add supplier page with name parameter
        router.push(`/profile/add?name=${encodeURIComponent(searchTerm)}`);
      }
    } catch (err) {
      console.error('Unexpected error during search:', err);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Find or Add a Profile</CardTitle>
        <CardDescription>Search for a supplier to analyze compliance and ESG risks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Enter supplier name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
        
        {/* Recommended Suppliers Section */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended for You</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={scrollLeft} className="rounded-full h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={scrollRight} className="rounded-full h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            ref={carouselRef} 
            className="overflow-x-auto flex gap-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {[
              {
                name: "NVIDIA",
                industry: "Semiconductors",
                country: "United States"
              },
              {
                name: "TSMC",
                industry: "Semiconductors",
                country: "Taiwan"
              },
              {
                name: "Samsung Electronics",
                industry: "Electronics",
                country: "South Korea"
              },
              {
                name: "Intel",
                industry: "Semiconductors",
                country: "United States"
              },
              {
                name: "ASML",
                industry: "Semiconductor Equipment",
                country: "Netherlands"
              }
            ].map((supplier) => (
              <div key={supplier.name} className="flex-shrink-0 w-72">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CompanyLogo companyName={supplier.name} size={40} />
                      <div>
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <p className="text-sm text-slate-500">{supplier.industry}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <Badge variant="secondary" className="w-full justify-center">{supplier.country}</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => router.push(`/profile/${encodeURIComponent(supplier.name)}`)}>
                      <Plus className="mr-2 h-4 w-4" />
                      View Supplier
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 