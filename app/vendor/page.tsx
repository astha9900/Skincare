import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ShoppingCart, DollarSign, Star, ArrowRight } from 'lucide-react'

export default async function VendorDashboard() {
  const session = await auth()
  const user = session?.user as { id?: string; name?: string; role?: string }
  if (!user?.id) redirect('/login')

  const [productCount, myProducts, recentOrders] = await Promise.all([
    prisma.product.count({ where: { vendorId: user.id } }),
    prisma.product.findMany({
      where: { vendorId: user.id },
      orderBy: { rating: 'desc' },
      take: 5,
      select: { id: true, name: true, price: true, rating: true, reviewCount: true, stockCount: true, inStock: true },
    }),
    prisma.order.findMany({
      where: {
        items: { some: { product: { vendorId: user.id } } },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: { where: { product: { vendorId: user.id } }, select: { quantity: true, price: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const totalRevenue = recentOrders.reduce((sum, o) =>
    sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0)
  const totalOrders = recentOrders.length

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700', PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-violet-100 text-violet-700', DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name ?? 'Vendor'}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s a snapshot of your store performance.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Products', value: productCount, icon: Package, color: 'text-blue-600' },
          { label: 'Recent Orders', value: totalOrders, icon: ShoppingCart, color: 'text-green-600' },
          { label: 'Revenue (recent)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-orange-500' },
          { label: 'Avg Rating', value: myProducts.length ? (myProducts.reduce((s, p) => s + p.rating, 0) / myProducts.length).toFixed(1) : '—', icon: Star, color: 'text-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top products */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">My Products</CardTitle>
            <Link href="/vendor/products"><Button variant="ghost" size="sm" className="h-7 text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {myProducts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">No products yet.</p>
                <Link href="/vendor/products"><Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 text-white">Add your first product</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-1 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">₹{p.price} · ⭐ {p.rating} · {p.reviewCount} reviews</p>
                    </div>
                    <Badge variant={p.inStock ? 'default' : 'secondary'}
                      className={`text-xs ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.inStock ? `${p.stockCount} left` : 'Out of stock'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/vendor/orders"><Button variant="ghost" size="sm" className="h-7 text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map(o => {
                  const lineTotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0)
                  return (
                    <div key={o.id} className="flex items-center gap-3 py-1 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{o.user.name ?? o.user.email}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <Badge className={`text-xs ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                      </Badge>
                      <span className="text-sm font-semibold">₹{lineTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
