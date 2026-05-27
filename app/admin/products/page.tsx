'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string; name: string; slug: string; brand: string; category: string
  description: string; price: number; originalPrice: number | null
  discount: number | null; rating: number; reviewCount: number
  inStock: boolean; stockCount: number; image: string
  ingredients: string | null; howToUse: string | null; tags: string[]
}

const CATEGORIES = ['Face Care', 'Hair Care', 'Body Care', 'Anti-Aging', 'Acne Care', 'Sun Care']
const BRANDS = ['Mamaearth', 'The Ordinary', 'Minimalist', 'Dot & Key', 'WOW Science', 'Plum', 'mCaffeine', 'Cetaphil']

const EMPTY: Partial<Product> = {
  name: '', brand: '', category: '', description: '', price: 0,
  originalPrice: null, discount: null, inStock: true, stockCount: 100,
  image: '', ingredients: '', howToUse: '', tags: [],
}

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY)
  const [isNew, setIsNew] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (search) params.set('search', search)
      const r = await fetch(`/api/products?${params}`)
      const d = await r.json()
      setProducts(d.products ?? [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditing(EMPTY)
    setIsNew(true)
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing({ ...p })
    setIsNew(false)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (r.ok) {
      toast({ title: 'Deleted', description: 'Product removed.' })
      load()
    } else {
      const d = await r.json()
      toast({ title: 'Error', description: formatApiError(d.error), variant: 'destructive' })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = isNew ? '/api/products' : `/api/products/${editing.id}`
      const method = isNew ? 'POST' : 'PUT'
      const r = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const d = await r.json()
      if (!r.ok) {
        toast({ title: 'Error', description: formatApiError(d.error, 'Failed to save'), variant: 'destructive' })
        return
      }
      toast({ title: isNew ? 'Created' : 'Updated', description: 'Product saved.' })
      setDialogOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setEditing(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={openNew} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />Add Product
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 max-w-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No products found.</div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill className="object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.brand} · {p.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm">₹{p.price}</span>
                      {p.discount && <Badge className="bg-brand-accent text-white text-xs">{p.discount}% OFF</Badge>}
                      <Badge variant={p.inStock ? 'default' : 'secondary'} className={`text-xs ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.inStock ? `In Stock (${p.stockCount})` : 'Out of Stock'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add Product' : 'Edit Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Name *</Label>
                <Input value={editing.name ?? ''} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Brand *</Label>
                <Select value={editing.brand ?? ''} onValueChange={v => set('brand', v)}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select value={editing.category ?? ''} onValueChange={v => set('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Price (₹) *</Label>
                <Input type="number" value={editing.price ?? ''} onChange={e => set('price', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Original Price (₹)</Label>
                <Input type="number" value={editing.originalPrice ?? ''} onChange={e => set('originalPrice', e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="space-y-1">
                <Label>Discount (%)</Label>
                <Input type="number" value={editing.discount ?? ''} onChange={e => set('discount', e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="space-y-1">
                <Label>Stock Count</Label>
                <Input type="number" value={editing.stockCount ?? ''} onChange={e => set('stockCount', Number(e.target.value))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Image URL</Label>
                <Input value={editing.image ?? ''} onChange={e => set('image', e.target.value)} placeholder="https://…" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Description *</Label>
                <Textarea rows={3} value={editing.description ?? ''} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Ingredients</Label>
                <Textarea rows={2} value={editing.ingredients ?? ''} onChange={e => set('ingredients', e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>How to Use</Label>
                <Textarea rows={2} value={editing.howToUse ?? ''} onChange={e => set('howToUse', e.target.value)} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <Switch checked={editing.inStock ?? true} onCheckedChange={v => set('inStock', v)} id="inStock" />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white"
                onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Product'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
