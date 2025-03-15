'use client'

import { Shield, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react"

export function Header() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      // Navigate after signout is complete
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
      })
    }
  }, [signOut, toast, router])

  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">CIAYN</h1>
            <p className="text-xs text-slate-500">Compliance Is All You Need</p>
          </div>
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/explore" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/my-suppliers" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">
                My Suppliers
              </Link>
            </li>
            <li>
              <Link href="#" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">
                Reports
              </Link>
            </li>
            <li>
              <Link href="#" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">
                Settings
              </Link>
            </li>
            {user ? (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login" passHref>
                    <Button variant="ghost">Login</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/register" passHref>
                    <Button>Register</Button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

