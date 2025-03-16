'use client'

import { User, Network } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SupplierNetwork } from "@/components/supplier-network"

export function Header() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
      })
    }
  }, [signOut, toast])

  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/stars.png" alt="CIAYN Stars" width={32} height={32} className="text-emerald-600" />
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
            {user && (
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 text-sm font-medium">
                      <Network className="h-4 w-4" />
                      Network
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Supplier Network</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <SupplierNetwork />
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
            )}
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
                      <Link href="/profile">User Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/disclosure">Disclosures</Link>
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
                  <Link href={`/login?redirectTo=${encodeURIComponent(pathname)}`} passHref>
                    <Button variant="ghost">Login</Button>
                  </Link>
                </li>
                <li>
                  <Link href={`/register?redirectTo=${encodeURIComponent(pathname)}`} passHref>
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
