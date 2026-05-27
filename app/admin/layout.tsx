import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { Store } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AdminNav } from '@/components/admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') redirect('/login?error=unauthorized')

  const user = session!.user as { name?: string }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col bg-card border-r">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-brand-primary" />
            <span className="font-bold text-sm">SkinGlow Admin</span>
          </Link>
        </div>
        <AdminNav />
        <div className="p-3 border-t">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            <Store className="h-4 w-4" />Back to Store
          </Link>
          <div className="px-3 py-2 text-xs text-muted-foreground">{user.name}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-6 w-6 rounded-full bg-brand-primary" />
            <span className="font-bold text-sm">Admin</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden border-b overflow-x-auto">
          <AdminNav mobile />
        </div>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
