'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { addToCart } from '@/lib/cart'
import { Heart, ShoppingCart, X } from 'lucide-react'

interface WishlistItem {
  id: string
  product: {
    id: string; name: string; slug: string; brand: string; price: number
    originalPrice?: number; discount?: number; image: string; inStock: boolean
  }
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/wishlist')
    if (status === 'authenticated') {
      fetch('/api/wishlist').then((r) => r.json()).then((data) => {
        if (Array.isArray(data)) setItems(data)
        setLoading(false)
      })
    }
  }, [status, router])

  const remove = async (productId: string) => {
    await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) })
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
    toast({ title: 'Removed from wishlist' })
  }

  const moveToCart = (item: WishlistItem) => {
    addToCart(item.product.id, 1, { name: item.product.name, image: item.product.image, price: item.product.price })
    window.dispatchEvent(new Event('cartUpdated'))
    toast({ title: 'Added to cart', description: item.product.name })
    remove(item.product.id)
  }

  const moveAllToCart = () => {
    items.forEach((item) => {
      if (item.product.inStock) moveToCart(item)
    })
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Wishlist <Badge variant="secondary">{items.length}</Badge>
            </h1>
            {items.length > 0 && (
              <Button onClick={moveAllToCart} variant="outline" size="sm">Move All to Cart</Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save items you love for later</p>
              <Link href="/products"><Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">Explore Products</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map(({ id, product }) => (
                <Card key={id} className="group overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {product.discount && (
                          <Badge className="absolute top-2 left-2 z-10 bg-brand-accent text-white text-xs">{product.discount}% OFF</Badge>
                        )}
                        <button
                          onClick={(e) => { e.preventDefault(); remove(product.id) }}
                          aria-label="Remove from wishlist"
                          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                        <Image src={product.image || '/placeholder.jpg'} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width:640px) 50vw, 25vw" />
                      </div>
                    </Link>
                    <div className="p-3 space-y-1">
                      <p className="text-xs text-brand-primary font-medium">{product.brand}</p>
                      <Link href={`/products/${product.slug}`}><p className="text-sm font-semibold line-clamp-2 hover:text-brand-primary transition-colors">{product.name}</p></Link>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">₹{product.price}</span>
                        {product.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>}
                      </div>
                      <Button size="sm" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-xs"
                        onClick={() => moveToCart({ id, product })} disabled={!product.inStock}>
                        <ShoppingCart className="h-3 w-3 mr-1" />{product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
