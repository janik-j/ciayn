'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { FormEvent } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterContent() {
  const { signUp } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please make sure your passwords match and try again.",
      })
      return
    }

    try {
      await signUp(email, password, redirectTo)
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      })
    } catch (error: any) {
      console.error("Registration failed:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error?.message || "Please try again with different credentials.",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href={`/login${redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
} 