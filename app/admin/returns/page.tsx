'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { RotateCcw, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface ReturnRequest {
  id: string; type: string; reason: string; status: string
  exchangeFor: string | null; adminNote: string | null; createdAt: string
  user: { name: string | null; email: string }
  order: { orderNumber: string; total: number }
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-800',
  APPROVED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

export default function AdminReturnsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [selected, setSelected] = useState<ReturnRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/returns')
      const d = await r.json()
      setRequests(Array.isArray(d) ? d : [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (status: string) => {
    if (!selected) return
    setSaving(true)
    const r = await fetch(`/api/admin/returns/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote }),
    })
    const d = await r.json()
    setSaving(false)
    if (r.ok) {
      toast({ title: `Request ${status.toLowerCase()}`, description: status === 'APPROVED' && selected.type === 'RETURN' ? 'Refund credited to customer wallet.' : undefined })
      setSelected(null)
      load()
    } else {
      toast({ title: 'Failed', description: formatApiError(d.error), variant: 'destructive' })
    }
  }

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Returns & Exchanges</h1>
        <span className="text-sm text-muted-foreground">{requests.filter(r => r.status === 'PENDING').length} pending</span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? 'default' : 'ghost'}
            className={`text-xs ${filter === s ? 'bg-brand-primary text-white' : ''}`}
            onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            {s !== 'ALL' && <span className="ml-1 opacity-60">({requests.filter(r => r.status === s).length})</span>}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No requests found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <Card key={req.id} className="cursor-pointer hover:border-brand-primary/40 transition-colors"
              onClick={() => { setSelected(req); setAdminNote(req.adminNote ?? '') }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${req.type === 'RETURN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {req.type === 'RETURN' ? <RotateCcw className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{req.order.orderNumber}</p>
                        <Badge className={`${STATUS_STYLES[req.status]} text-xs`}>{req.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.user.name ?? req.user.email} · ₹{req.order.total.toFixed(0)}</p>
                      <p className="text-sm mt-1 line-clamp-1">{req.reason}</p>
                      {req.exchangeFor && <p className="text-xs text-muted-foreground">Exchange for: {req.exchangeFor}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review {selected?.type === 'RETURN' ? 'Return' : 'Exchange'} Request</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span className="font-medium">{selected.order.orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{selected.user.name ?? selected.user.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>₹{selected.order.total.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge className={selected.type === 'RETURN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>{selected.type}</Badge></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Customer Reason</p>
                <p className="text-sm bg-muted rounded p-2">{selected.reason}</p>
              </div>
              {selected.exchangeFor && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Exchange For</p>
                  <p className="text-sm">{selected.exchangeFor}</p>
                </div>
              )}
              {selected.type === 'RETURN' && selected.status === 'PENDING' && (
                <p className="text-xs text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                  Approving will automatically credit ₹{selected.order.total.toFixed(0)} to the customer&apos;s Skin Wallet.
                </p>
              )}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Admin Note (optional)</p>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note for the customer…" rows={2} />
              </div>
              {selected.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={saving}
                    onClick={() => handleAction('APPROVED')}>
                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                  </Button>
                  <Button className="flex-1" variant="destructive" disabled={saving}
                    onClick={() => handleAction('REJECTED')}>
                    <XCircle className="h-4 w-4 mr-1" />Reject
                  </Button>
                </div>
              )}
              {selected.status === 'APPROVED' && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}
                  onClick={() => handleAction('COMPLETED')}>
                  Mark as Completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
