'use client'

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

// Define an interface for supplier data
interface SupplierData {
  id: string;
  name: string;
  industry: string;
  country: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [claimedSupplier, setClaimedSupplier] = useState<SupplierData | null>(null)
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false)
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/profile')
    }
  }, [user, loading, router])

  // Fetch the user's claimed supplier when the user is loaded
  useEffect(() => {
    const fetchClaimedSupplier = async () => {
      if (!user) return;
      
      setIsLoadingSupplier(true);
      try {
        // Check if user has claimed a supplier
        const { data: association, error: associationError } = await supabase
          .from('user_supplier_association')
          .select('supplier')
          .eq('user', user.id)
          .single();
        
        if (associationError) {
          // No supplier found or error (PGRST116 is expected if no supplier)
          if (associationError.code !== 'PGRST116') {
            console.error('Error fetching supplier association:', associationError);
          }
          setIsLoadingSupplier(false);
          return;
        }
        
        // Fetch the supplier details
        const { data: supplier, error: supplierError } = await supabase
          .from('suppliers')
          .select('id, name, industry, country')
          .eq('id', association.supplier)
          .single();
        
        if (supplierError) {
          console.error('Error fetching supplier data:', supplierError);
          setIsLoadingSupplier(false);
          return;
        }
        
        setClaimedSupplier(supplier);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoadingSupplier(false);
      }
    };
    
    fetchClaimedSupplier();
  }, [user]);

  // Don't render anything if not logged in
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and manage your profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">User ID</h3>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Last Sign In</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.last_sign_in_at || '').toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Claimed Supplier Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Supplier</CardTitle>
              <CardDescription>
                {claimedSupplier ? 'You have claimed the following supplier' : 'You have not claimed any supplier yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSupplier ? (
                <div className="text-sm text-muted-foreground">Loading supplier information...</div>
              ) : claimedSupplier ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Name</h3>
                    <p className="text-sm text-muted-foreground">{claimedSupplier.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Industry</h3>
                    <p className="text-sm text-muted-foreground">{claimedSupplier.industry}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Country</h3>
                    <p className="text-sm text-muted-foreground">{claimedSupplier.country}</p>
                  </div>
                  <div className="pt-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/profile/${encodeURIComponent(claimedSupplier.name)}`}>
                        View Supplier Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can claim a supplier in the Explore section or when searching for a specific supplier.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/explore">
                      Explore Suppliers
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 