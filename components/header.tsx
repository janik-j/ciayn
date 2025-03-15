import { Shield } from "lucide-react"
import Link from "next/link"

export function Header() {
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
              <Link href="/" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/suppliers" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">
                Suppliers
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
          </ul>
        </nav>
      </div>
    </header>
  )
}

