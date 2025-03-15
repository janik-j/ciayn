'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, redirectTo?: string) => Promise<void>
  signUp: (email: string, password: string, redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active sessions and sets the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signIn = useCallback(async (email: string, password: string, redirectTo: string = '/') => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    router.push(redirectTo)
  }, [router])

  const signUp = useCallback(async (email: string, password: string, redirectTo: string = '/') => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    router.push(redirectTo)
  }, [router])

  const signOut = useCallback(async () => {
    try {
      // First initiate the navigation
      router.push('/');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Finally set user to null after navigation has started
      setUser(null)
    } catch (error) {
      throw error
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 