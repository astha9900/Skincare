import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { LayoutDashboard, Package, ShoppingCart, BarChart2, Store } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV = [
  { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'My Products', icon: Package },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/earnings', label: 'Earnings', icon: BarChart2 },
]

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role
  if (role !== 'VENDOR' && role !== 'ADMIN') redirect('/login?error=unauthorized')

  const user = session!.user as { name?: string; email?: string }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-56 flex-col bg-card border-r">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-brand-primary" />
            <span className="font-bold text-sm">Vendor Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            <Store className="h-4 w-4" />Back to Store
          </Link>
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.name ?? user.email}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-6 w-6 rounded-full bg-brand-primary" />
            <span className="font-bold text-sm">Vendor</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <div className="lg:hidden border-b overflow-x-auto">
          <nav className="flex gap-1 p-2 min-w-max">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted whitespace-nowrap transition-colors">
                <Icon className="h-3 w-3" />{label}
              </Link>
            ))}
          </nav>
        </div>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
