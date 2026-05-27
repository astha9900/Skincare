'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { Plus, Trash2, Percent, DollarSign, Copy } from 'lucide-react'

interface Coupon {
  id: string; code: string; type: 'PERCENTAGE' | 'FIXED'
  value: number; minOrder: number; maxUses: number | null; usedCount: number
  expiresAt: string | null; isActive: boolean; createdAt: string
}

type CouponFormState = {
  code: string; type: 'PERCENTAGE' | 'FIXED'; value: number | string
  minOrder: number | string; maxUses: string; expiresAt: string; isActive: boolean
}

const EMPTY_COUPON: CouponFormState = {
  code: '', type: 'PERCENTAGE', value: 10, minOrder: 0,
  maxUses: '', expiresAt: '', isActive: true,
}

export default function AdminCouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CouponFormState>(EMPTY_COUPON)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/coupons')
      const d = await r.json()
      setCoupons(Array.isArray(d) ? d : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setForm(EMPTY_COUPON)
    setDialogOpen(true)
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/coupons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrder: Number(form.minOrder),
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      })
      const d = await r.json()
      if (!r.ok) {
        toast({ title: 'Error', description: formatApiError(d.error, 'Failed to create coupon'), variant: 'destructive' })
        return
      }
      toast({ title: 'Created', description: `Coupon ${d.code} created.` })
      setDialogOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return
    const r = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (r.ok) {
      toast({ title: 'Deleted', description: `Coupon ${code} removed.` })
      load()
    } else {
      const d = await r.json()
      toast({ title: 'Error', description: formatApiError(d.error), variant: 'destructive' })
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const r = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (r.ok) load()
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast({ title: 'Copied!', description: `${code} copied to clipboard.` })
  }

  function isExpired(c: Coupon) {
    return c.expiresAt ? new Date(c.expiresAt) < new Date() : false
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={openNew} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />New Coupon
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No coupons yet. Create one!</div>
      ) : (
        <div className="space-y-3">
          {coupons.map(c => {
            const expired = isExpired(c)
            return (
              <Card key={c.id} className={!c.isActive || expired ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${c.type === 'PERCENTAGE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {c.type === 'PERCENTAGE' ? <Percent className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{c.code}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyCode(c.code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        {expired && <Badge variant="secondary" className="text-xs bg-red-100 text-red-600">Expired</Badge>}
                        {!c.isActive && !expired && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {c.type === 'PERCENTAGE' ? `${c.value}% off` : `₹${c.value} off`}
                        {c.minOrder > 0 ? ` · Min order ₹${c.minOrder}` : ''}
                        {c.maxUses ? ` · ${c.usedCount}/${c.maxUses} used` : ` · ${c.usedCount} used`}
                        {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString('en-IN')}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Switch checked={c.isActive} onCheckedChange={v => toggleActive(c.id, v)} />
                        <span className="text-xs text-muted-foreground">{c.isActive ? 'Active' : 'Off'}</span>
                      </div>
                      <Button size="sm" variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleDelete(c.id, c.code)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Code *</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'PERCENTAGE' | 'FIXED' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Value * {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</Label>
                <Input type="number" value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Min Order (₹)</Label>
                <Input type="number" value={form.minOrder}
                  onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Max Uses (blank = unlimited)</Label>
                <Input type="number" value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="∞" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Expires At (blank = never)</Label>
                <Input type="date" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} id="active" />
                <Label htmlFor="active">Active immediately</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white"
                onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating…' : 'Create Coupon'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
