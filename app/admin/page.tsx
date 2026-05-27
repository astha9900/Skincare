'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Image from 'next/image'

type Period = '7d' | '30d' | '90d'

interface Stats {
  totalRevenue: number; revenueGrowth: number
  currentOrders: number; ordersGrowth: number
  totalUsers: number; usersGrowth: number
  avgOrderValue: number
  revenueByDay: { date: string; revenue: number; orders: number }[]
  ordersByStatus: { status: string; _count: number }[]
  topProducts: { id: string; name: string; image: string; unitsSold: number; revenue: number }[]
  recentOrders: {
    id: string; orderNumber: string; total: number; status: string; createdAt: string
    user: { name: string | null; email: string }
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', PROCESSING: '#3b82f6', SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981', CANCELLED: '#ef4444',
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']

function GrowthBadge({ value }: { value: number }) {
  const pos = value >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  )
}

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}` }

function statusLabel(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('30d')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/stats?period=${period}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  const kpis = stats ? [
    { title: 'Revenue', value: fmt(stats.totalRevenue), growth: stats.revenueGrowth, icon: DollarSign, color: 'text-green-600' },
    { title: 'Orders', value: stats.currentOrders, growth: stats.ordersGrowth, icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'New Customers', value: stats.totalUsers, growth: stats.usersGrowth, icon: Users, color: 'text-purple-600' },
    { title: 'Avg Order Value', value: fmt(stats.avgOrderValue), growth: 0, icon: Package, color: 'text-orange-500' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your store performance</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'ghost'} size="sm"
              className="h-7 px-3 text-xs" onClick={() => setPeriod(p)}>
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        )) : kpis.map(({ title, value, growth, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{title}</p>
                  <p className="text-2xl font-bold">{value}</p>
                  <div className="mt-1"><GrowthBadge value={growth} /></div>
                </div>
                <div className={`p-2 rounded-lg bg-muted ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue/Orders Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue & Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats?.revenueByDay ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis yAxisId="rev" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={48} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11 }} width={30} />
                  <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? fmt(v) : v, name === 'revenue' ? 'Revenue' : 'Orders']} labelFormatter={l => `Date: ${l}`} />
                  <Legend />
                  <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="revenue" />
                  <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} name="orders" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats?.ordersByStatus ?? []} dataKey="_count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }: { status: string; percent: number }) => `${statusLabel(status)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {(stats?.ordersByStatus ?? []).map((entry, i) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, statusLabel(name)]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <div className="space-y-3">
                {(stats?.topProducts ?? []).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    {p.image ? (
                      <Image src={p.image} alt={p.name} width={36} height={36} className="rounded object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded bg-muted flex items-center justify-center text-xs">-</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.unitsSold} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{fmt(p.revenue)}</span>
                  </div>
                ))}
                {!stats?.topProducts?.length && <p className="text-sm text-muted-foreground text-center py-4">No sales yet</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <div className="space-y-2">
                {(stats?.recentOrders ?? []).map(o => (
                  <div key={o.id} className="flex items-center gap-3 py-1 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.user.name ?? o.user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs" style={{ color: STATUS_COLORS[o.status], borderColor: STATUS_COLORS[o.status] }}>
                      {statusLabel(o.status)}
                    </Badge>
                    <span className="text-sm font-semibold">{fmt(o.total)}</span>
                  </div>
                ))}
                {!stats?.recentOrders?.length && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
