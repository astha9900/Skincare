import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Package, ShoppingCart } from 'lucide-react'

export default async function VendorEarningsPage() {
  const session = await auth()
  const user = session?.user as { id?: string }
  if (!user?.id) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const [allItems, recentItems, prevItems, productCount] = await Promise.all([
    prisma.orderItem.findMany({
      where: { product: { vendorId: user.id }, order: { status: { not: 'CANCELLED' } } },
      select: { quantity: true, price: true, order: { select: { createdAt: true } } },
    }),
    prisma.orderItem.findMany({
      where: {
        product: { vendorId: user.id },
        order: { status: { not: 'CANCELLED' }, createdAt: { gte: thirtyDaysAgo } },
      },
      select: { quantity: true, price: true },
    }),
    prisma.orderItem.findMany({
      where: {
        product: { vendorId: user.id },
        order: { status: { not: 'CANCELLED' }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      },
      select: { quantity: true, price: true },
    }),
    prisma.product.count({ where: { vendorId: user.id } }),
  ])

  const totalRevenue = allItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const recentRevenue = recentItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const prevRevenue = prevItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const growth = prevRevenue > 0 ? Math.round(((recentRevenue - prevRevenue) / prevRevenue) * 100) : 0
  const totalUnitsSold = allItems.reduce((s, i) => s + i.quantity, 0)

  // Revenue by day for last 30 days
  const dayMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dayMap[d.toISOString().split('T')[0]] = 0
  }
  for (const item of allItems) {
    const key = item.order.createdAt.toISOString().split('T')[0]
    if (key in dayMap) dayMap[key] += item.price * item.quantity
  }
  const chartData = Object.entries(dayMap).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-600' },
          { label: 'Last 30 Days', value: `₹${recentRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Units Sold', value: totalUnitsSold.toLocaleString(), icon: ShoppingCart, color: 'text-orange-500' },
          { label: 'Products Listed', value: productCount, icon: Package, color: 'text-violet-600' },
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

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">30-Day Revenue Trend</CardTitle>
            <span className={`text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs prior 30d
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {chartData.slice(-14).map(({ date, revenue }) => {
              const max = Math.max(...chartData.map(d => d.revenue), 1)
              const pct = (revenue / max) * 100
              return (
                <div key={date} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{date}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-brand-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium w-20 text-right">₹{revenue.toLocaleString('en-IN')}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
