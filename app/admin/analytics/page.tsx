'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

type Period = '7d' | '30d' | '90d'

interface Stats {
  totalRevenue: number; revenueGrowth: number
  currentOrders: number; ordersGrowth: number
  totalUsers: number; usersGrowth: number
  avgOrderValue: number
  revenueByDay: { date: string; revenue: number; orders: number }[]
  ordersByStatus: { status: string; _count: number }[]
  topProducts: { id: string; name: string; unitsSold: number; revenue: number }[]
  revenueByCategory?: { category: string; revenue: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', PROCESSING: '#3b82f6', SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981', CANCELLED: '#ef4444',
}
const CAT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899']

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}` }

export default function AdminAnalyticsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'ghost'} size="sm"
              className={`h-7 px-3 text-xs ${period === p ? 'bg-brand-primary text-white' : ''}`}
              onClick={() => setPeriod(p)}>
              {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: stats ? fmt(stats.totalRevenue) : '—', growth: stats?.revenueGrowth },
          { label: 'Orders', value: stats?.currentOrders ?? '—', growth: stats?.ordersGrowth },
          { label: 'New Users', value: stats?.totalUsers ?? '—', growth: stats?.usersGrowth },
          { label: 'Avg Order', value: stats ? fmt(stats.avgOrderValue) : '—', growth: null },
        ].map(({ label, value, growth }) => (
          <Card key={label}>
            <CardContent className="p-4">
              {loading ? <Skeleton className="h-12 w-full" /> : (
                <>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                  {growth !== null && growth !== undefined && (
                    <p className={`text-xs mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs prior period
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.revenueByDay ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={52} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} labelFormatter={l => `Date: ${l}`} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Orders trend + Status breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={stats?.revenueByDay ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} width={30} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [v, 'Orders']} />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={stats?.ordersByStatus ?? []} dataKey="_count" nameKey="status"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {(stats?.ordersByStatus ?? []).map((entry, i) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name ? name.charAt(0) + name.slice(1).toLowerCase() : '']} />
                  <Legend formatter={(name: string) => name ? name.charAt(0) + name.slice(1).toLowerCase() : ''} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-52 w-full" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats?.topProducts ?? []} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
