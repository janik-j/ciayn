"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { searchSuppliers } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function DashboardSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

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
      </CardContent>
    </Card>
  )
} 