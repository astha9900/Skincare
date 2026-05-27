'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { Search, Download } from 'lucide-react'
import Image from 'next/image'

type Status = 'ALL' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface OrderItem { id: string; productName: string; productImage: string; quantity: number; price: number }
interface Order {
  id: string; orderNumber: string; total: number; status: string; paymentMethod: string; createdAt: string
  user: { name: string | null; email: string }
  items: OrderItem[]
  shippingAddress: { name: string; phone: string; line1: string; city: string; state: string; pincode: string }
}

const STATUS_TABS: Status[] = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800', DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Status>('ALL')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (tab !== 'ALL') params.set('status', tab)
      if (search) params.set('search', search)
      const r = await fetch(`/api/orders?${params}`)
      const d = await r.json()
      setOrders(d.orders ?? [])
    } finally {
      setLoading(false)
    }
  }, [tab, search])

  useEffect(() => { load() }, [load])

  async function handleStatus(orderId: string, status: string) {
    const r = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (r.ok) {
      toast({ title: 'Updated', description: `Order status set to ${status.toLowerCase()}` })
      load()
    } else {
      const d = await r.json()
      toast({ title: 'Error', description: formatApiError(d.error), variant: 'destructive' })
    }
  }

  function exportCSV() {
    const rows = [
      ['Order #', 'Customer', 'Email', 'Status', 'Total', 'Date'],
      ...orders.map(o => [
        o.orderNumber, o.user.name ?? '', o.user.email, o.status,
        o.total.toString(), new Date(o.createdAt).toLocaleDateString('en-IN'),
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `orders-${tab.toLowerCase()}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <Button key={s} variant={tab === s ? 'default' : 'ghost'} size="sm"
            className={`whitespace-nowrap ${tab === s ? 'bg-brand-primary text-white' : ''}`}
            onClick={() => setTab(s)}>
            {s === 'ALL' ? 'All Orders' : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by order # or customer…" value={search}
          onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <Card key={o.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.user.name ?? o.user.email} · {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'}>
                      {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                    </Badge>
                    <Select value={o.status} onValueChange={v => handleStatus(o.id, v)}>
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {o.items.slice(0, 4).map(item => (
                    <div key={item.id} className="flex-shrink-0 flex gap-2 items-center bg-muted/50 rounded px-2 py-1">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} width={32} height={32}
                          className="rounded object-cover flex-shrink-0" />
                      ) : null}
                      <div>
                        <p className="text-xs font-medium line-clamp-1 max-w-[120px]">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">×{item.quantity} · ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                  {o.items.length > 4 && (
                    <div className="flex-shrink-0 flex items-center px-2 text-xs text-muted-foreground">
                      +{o.items.length - 4} more
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    <p>{o.shippingAddress.name} · {o.shippingAddress.city}, {o.shippingAddress.state}</p>
                    <p>Payment: {o.paymentMethod}</p>
                  </div>
                  <p className="font-bold">₹{o.total.toLocaleString('en-IN')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
