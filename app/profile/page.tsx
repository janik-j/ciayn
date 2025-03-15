'use client'

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/profile')
    }
  }, [user, loading, router])

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
        
        <div className="max-w-2xl mx-auto">
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
        </div>
      </main>
    </div>
  )
} 