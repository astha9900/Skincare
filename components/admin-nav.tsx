'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart2, RotateCcw } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  if (mobile) {
    return (
      <nav className="flex gap-1 p-2 min-w-max">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${active ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Icon className="h-3 w-3" />{label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex-1 p-3 space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            <Icon className="h-4 w-4" />{label}
          </Link>
        )
      })}
    </nav>
  )
}
