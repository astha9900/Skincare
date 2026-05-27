'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { SlidersHorizontal, X, LayoutGrid, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'

const CATEGORIES = ['Face Care', 'Hair Care', 'Body Care', 'Anti-Aging', 'Acne Care', 'Sun Care']
const BRANDS = ['Mamaearth', 'Minimalist', 'WOW', 'Plum', 'Lakme', 'Dot & Key', 'Neutrogena']

interface Product {
  id: string; name: string; slug: string; brand: string; category: string
  price: number; originalPrice?: number; discount?: number; rating: number
  reviewCount: number; image: string; inStock: boolean; stockCount: number
}

interface SkinProfileMini { skinType: string | null }

function FiltersPanel({ params, onParamChange, onClear, skinProfile }: {
  params: URLSearchParams
  onParamChange: (key: string, value: string | null) => void
  onClear: () => void
  skinProfile?: SkinProfileMini | null
}) {
  const [price, setPrice] = useState([0, 2000])

  const selectedCats = params.get('category')?.split(',').filter(Boolean) ?? []
  const selectedBrands = params.get('brand')?.split(',').filter(Boolean) ?? []

  const toggleMulti = (key: string, current: string[], val: string) => {
    const next = current.includes(val) ? current.filter((c) => c !== val) : [...current, val]
    onParamChange(key, next.length ? next.join(',') : null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>Clear All</Button>
      </div>

      {skinProfile && (
        <div className="pb-4 border-b">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />Personalised
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={params.get('recommended') === 'true'}
              onCheckedChange={(v) => onParamChange('recommended', v ? 'true' : null)}
            />
            <span className="text-sm">Recommended for me</span>
          </label>
          {skinProfile.skinType && (
            <p className="text-xs text-muted-foreground mt-1">
              Based on your {skinProfile.skinType.toLowerCase()} skin profile
            </p>
          )}
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCats.includes(cat)}
                onCheckedChange={() => toggleMulti('category', selectedCats, cat)}
              />
              <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Brand</h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleMulti('brand', selectedBrands, brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">{brand}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <Slider
          min={0} max={2000} step={50}
          value={price}
          onValueChange={setPrice}
          onValueCommit={(v) => {
            onParamChange('minPrice', v[0] > 0 ? String(v[0]) : null)
            onParamChange('maxPrice', v[1] < 2000 ? String(v[1]) : null)
          }}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹{price[0]}</span><span>₹{price[1]}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="instock"
          checked={params.get('inStock') === 'true'}
          onCheckedChange={(v) => onParamChange('inStock', v ? 'true' : null)}
        />
        <Label htmlFor="instock" className="text-sm cursor-pointer">In Stock Only</Label>
      </div>
    </div>
  )
}

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [skinProfile, setSkinProfile] = useState<SkinProfileMini | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?${searchParams.toString()}`)
      const data = await res.json()
      setProducts(data.products ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    if (session) {
      fetch('/api/quiz/save').then((r) => r.json()).then((data) => {
        setSkinProfile(data ?? null)
      }).catch(() => {})
    }
  }, [session])

  const page = parseInt(searchParams.get('page') ?? '1')

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value === null) p.delete(key)
    else p.set(key, value)
    if (key !== 'page') p.set('page', '1')
    router.push(`/products?${p.toString()}`)
  }

  const clearAll = () => router.push('/products')

  // Active filter chips
  const activeFilters: { label: string; key: string }[] = []
  if (searchParams.get('category')) activeFilters.push({ label: searchParams.get('category')!, key: 'category' })
  if (searchParams.get('brand')) activeFilters.push({ label: searchParams.get('brand')!, key: 'brand' })
  if (searchParams.get('minPrice')) activeFilters.push({ label: `₹${searchParams.get('minPrice')}+`, key: 'minPrice' })
  if (searchParams.get('inStock')) activeFilters.push({ label: 'In Stock', key: 'inStock' })
  if (searchParams.get('recommended')) activeFilters.push({ label: '✨ For Me', key: 'recommended' })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-brand-light/30 to-background py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>

            <div className="flex gap-8">
              {/* Desktop sidebar */}
              <aside className="hidden lg:block w-56 shrink-0">
                <FiltersPanel params={searchParams} onParamChange={setParam} onClear={clearAll} skinProfile={skinProfile} />
              </aside>

              <div className="flex-1 min-w-0">
                {/* Top bar */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {/* Mobile filter button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72">
                      <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                      <div className="mt-4">
                        <FiltersPanel params={searchParams} onParamChange={setParam} onClear={clearAll} skinProfile={skinProfile} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <span className="text-sm text-muted-foreground">
                    Showing {products.length} of {total} products
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <Select value={searchParams.get('sort') ?? 'popular'} onValueChange={(v) => setParam('sort', v)}>
                      <SelectTrigger className="w-44 h-8 text-sm">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating-desc">Highest Rated</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="icon" onClick={() => setView('grid')} aria-label="Grid view"
                      className={view === 'grid' ? 'text-brand-primary' : ''}>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setView('list')} aria-label="List view"
                      className={view === 'list' ? 'text-brand-primary' : ''}>
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Active filter chips */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeFilters.map((f) => (
                      <Badge key={f.key} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setParam(f.key, null)}>
                        {f.label} <X className="h-3 w-3" />
                      </Badge>
                    ))}
                    <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline">
                      Clear all
                    </button>
                  </div>
                )}

                {/* Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg mb-4">No products found</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={clearAll} variant="outline">Clear Filters</Button>
                      {!skinProfile && (
                        <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                          <Link href="/skin-quiz">
                            <Sparkles className="h-4 w-4 mr-2" />Take our quiz to find your match
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={view === 'grid'
                    ? 'grid grid-cols-2 lg:grid-cols-4 gap-4'
                    : 'flex flex-col gap-4'}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} view={view} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button variant="outline" size="sm" disabled={page <= 1}
                      onClick={() => setParam('page', String(page - 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {(() => {
                      const window = 3
                      let start = Math.max(1, page - Math.floor(window / 2))
                      const end = Math.min(totalPages, start + window - 1)
                      start = Math.max(1, end - window + 1)
                      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
                    })().map((p) => (
                      <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm"
                        onClick={() => setParam('page', String(p))}
                        className={p === page ? 'bg-brand-primary' : ''}>
                        {p}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" disabled={page >= totalPages}
                      onClick={() => setParam('page', String(page + 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  )
}
