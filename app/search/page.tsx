'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Clock, X } from 'lucide-react'

const POPULAR = ['Face Wash', 'Serum', 'Sunscreen', 'Moisturizer', 'Hair Oil', 'Niacinamide', 'Retinol', 'Aloe Vera']
const HISTORY_KEY = 'skincare_searches'

interface Product { id: string; name: string; slug: string; brand: string; category: string; price: number; originalPrice?: number; discount?: number; rating: number; reviewCount: number; image: string; inStock: boolean; stockCount: number }

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}
function addHistory(q: string) {
  const h = [q, ...getHistory().filter((s) => s !== q)].slice(0, 8)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setHistory(getHistory()) }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setLoading(true)
    const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=24`)
    const data = await res.json()
    setResults(Array.isArray(data.products) ? data.products : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); search(q) }
  }, [searchParams, search])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(() => search(query), 300)
  }, [query, search])

  const handleSearch = (q: string) => {
    addHistory(q)
    setHistory(getHistory())
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const removeHistory = (q: string) => {
    const h = getHistory().filter((s) => s !== q)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
    setHistory(h)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-brand-light/30 to-background py-8">
          <div className="container mx-auto px-4">
            {/* Search input */}
            <div className="max-w-xl mx-auto mb-8">
              <form onSubmit={(e) => { e.preventDefault(); if (query.trim()) handleSearch(query) }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products, brands…"
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </form>
            </div>

            {!query && (
              <div className="max-w-xl mx-auto space-y-6">
                {history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Recent Searches</h3>
                    <div className="space-y-2">
                      {history.map((h) => (
                        <div key={h} className="flex items-center justify-between">
                          <button onClick={() => { setQuery(h); handleSearch(h) }} className="flex items-center gap-2 text-sm hover:text-brand-primary">
                            <Clock className="h-4 w-4 text-muted-foreground" />{h}
                          </button>
                          <button onClick={() => removeHistory(h)} aria-label="Remove"><X className="h-3 w-3 text-muted-foreground" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map((s) => (
                      <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-brand-primary hover:text-white transition-colors"
                        onClick={() => { setQuery(s); handleSearch(s) }}>
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {query && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  {loading ? 'Searching…' : `${results.length} results for "${query}"`}
                </p>

                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No results for &quot;{query}&quot;</h2>
                    <p className="text-muted-foreground mb-6">Try: Face Wash, Serum, Sunscreen, Moisturizer</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {POPULAR.map((s) => (
                        <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setQuery(s)}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {results.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>
}
