'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  originalPrice?: number | null
  discount?: number | null
  rating: number
  reviewCount: number
  image: string
  inStock: boolean
  stockCount: number
}

interface ProductCardProps {
  product: Product
  view?: 'grid' | 'list'
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!product.inStock) return
    addToCart(product.id, 1, { name: product.name, image: product.image, price: product.price })
    window.dispatchEvent(new Event('cartUpdated'))
    toast({ title: 'Added to cart', description: `${product.name} added to your cart.` })
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) { toast({ title: 'Login required', description: 'Please login to use wishlist', variant: 'destructive' }); return }
    setWishlistLoading(true)
    const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) })
    const data = await res.json()
    setWishlisted(data.added)
    setWishlistLoading(false)
    toast({ title: data.added ? 'Added to wishlist' : 'Removed from wishlist' })
  }

  if (view === 'list') {
    return (
      <Link href={`/products/${product.slug}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex gap-4">
            <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-muted">
              {product.discount && <Badge className="absolute top-1 left-1 bg-brand-accent text-white text-xs">{product.discount}% OFF</Badge>}
              <Image src={product.image || '/placeholder.jpg'} alt={product.name} fill className="object-cover" sizes="128px" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <p className="text-sm text-brand-primary font-medium">{product.brand}</p>
                <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">₹{product.price}</span>
                  {product.originalPrice && <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 text-white" onClick={handleAddToCart} disabled={!product.inStock}>
                  <ShoppingCart className="h-3 w-3 mr-1" />{product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
        <CardContent className="p-4 flex-1">
          <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
            {product.discount && (
              <Badge className="absolute top-2 left-2 z-10 bg-brand-accent text-white">{product.discount}% OFF</Badge>
            )}
            {product.stockCount < 10 && product.inStock && (
              <Badge className="absolute bottom-2 left-2 z-10 bg-orange-500 text-white text-xs">Only {product.stockCount} left!</Badge>
            )}
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
            <Image
              src={product.image || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-brand-primary font-medium">{product.brand}</p>
            <h3 className="font-semibold text-foreground line-clamp-2">{product.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">₹{product.price}</span>
              {product.originalPrice && <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
