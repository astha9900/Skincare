'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { addToCart } from '@/lib/cart'
import { trackView, getRecentlyViewed, type RecentProduct } from '@/lib/recently-viewed'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductCard } from '@/components/product-card'
import {
  Star, ShoppingCart, Heart, Share2, ChevronRight, Minus, Plus,
  CheckCircle, AlertTriangle, XCircle, ThumbsUp
} from 'lucide-react'

interface Review {
  id: string; rating: number; title: string; body: string; verified: boolean
  helpfulCount: number; createdAt: Date; user: { name: string; avatar: string | null }
}

interface Product {
  id: string; name: string; slug: string; brand: string; category: string
  price: number; originalPrice?: number | null; discount?: number | null
  rating: number; reviewCount: number; image: string; images: string[]
  description: string; ingredients: string; howToUse: string
  inStock: boolean; stockCount: number; reviews: Review[]
}

interface Props {
  product: Product
  related: Omit<Product, 'reviews'>[]
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)} aria-label={`${star} stars`}>
          <Star className={`h-6 w-6 ${(hover || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4">{star}★</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-muted-foreground">{pct}%</span>
    </div>
  )
}

export function ProductDetailClient({ product, related }: Props) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [qty, setQty] = useState(1)
  const [mainImg, setMainImg] = useState(product.image)
  const [wishlisted, setWishlisted] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([])

  useEffect(() => {
    trackView({
      id: product.id, name: product.name, slug: product.slug, brand: product.brand,
      category: product.category, price: product.price, originalPrice: product.originalPrice,
      discount: product.discount, image: product.image, rating: product.rating,
      reviewCount: product.reviewCount, inStock: product.inStock, stockCount: product.stockCount,
    })
    setRecentlyViewed(getRecentlyViewed().filter((p) => p.id !== product.id).slice(0, 4))
  }, [product])

  const handleAddToCart = () => {
    addToCart(product.id, qty, { name: product.name, image: product.image, price: product.price })
    window.dispatchEvent(new Event('cartUpdated'))
    toast({ title: 'Added to cart', description: `${qty}× ${product.name} added.` })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/checkout'
  }

  const handleWishlist = async () => {
    if (!session) { toast({ title: 'Login required', variant: 'destructive' }); return }
    const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) })
    const data = await res.json()
    setWishlisted(data.added)
    toast({ title: data.added ? 'Added to wishlist' : 'Removed from wishlist' })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({ title: 'Link copied!' })
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    if (reviewRating === 0) { toast({ title: 'Please select a rating', variant: 'destructive' }); return }
    setSubmittingReview(true)
    const res = await fetch(`/api/products/${product.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, title: reviewTitle, body: reviewBody }),
    })
    setSubmittingReview(false)
    if (res.ok) {
      toast({ title: 'Review submitted!' })
      setReviewRating(0); setReviewTitle(''); setReviewBody('')
    } else {
      const data = await res.json()
      toast({ title: 'Failed to submit review', description: formatApiError(data.error), variant: 'destructive' })
    }
  }

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: product.reviews.filter((r) => r.rating === s).length,
  }))

  const ingredientsList = product.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
  const steps = product.howToUse.split('.').map((s) => s.trim()).filter(Boolean)

  const stockStatus = !product.inStock
    ? { label: 'Out of Stock', icon: <XCircle className="h-4 w-4" />, cls: 'text-destructive' }
    : product.stockCount < 10
    ? { label: `Only ${product.stockCount} left!`, icon: <AlertTriangle className="h-4 w-4" />, cls: 'text-orange-500' }
    : { label: 'In Stock', icon: <CheckCircle className="h-4 w-4" />, cls: 'text-green-600' }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
            <Image src={mainImg || '/placeholder.jpg'} alt={product.name} fill
              className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:1024px) 100vw, 50vw" priority />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${mainImg === img ? 'border-brand-primary' : 'border-transparent'}`}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <Link href={`/products?brand=${encodeURIComponent(product.brand)}`}>
            <Badge variant="secondary" className="text-brand-primary border-brand-primary/30">{product.brand}</Badge>
          </Link>

          <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground">({product.reviewCount} reviews)</a>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">₹{product.price}</span>
            {product.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
            {product.discount && <Badge className="bg-brand-accent text-white">{product.discount}% OFF</Badge>}
          </div>

          <div className={`flex items-center gap-1.5 font-medium ${stockStatus.cls}`}>
            {stockStatus.icon}<span>{stockStatus.label}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus className="h-3 w-3" /></Button>
              <span className="px-4 font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(product.stockCount, qty + 1))} aria-label="Increase"><Plus className="h-3 w-3" /></Button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white flex-1" onClick={handleAddToCart} disabled={!product.inStock}>
              <ShoppingCart className="mr-2 h-5 w-5" />Add to Cart
            </Button>
            <Button size="lg" className="bg-brand-accent hover:bg-brand-accent/90 text-white flex-1" onClick={handleBuyNow} disabled={!product.inStock}>
              Buy Now
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleWishlist}>
              <Heart className={`mr-2 h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} aria-label="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-green-600 font-medium">Free delivery on orders above ₹499</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" id="reviews" className="mb-12">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </TabsContent>

        <TabsContent value="ingredients">
          <ul className="space-y-2">
            {ingredientsList.map((ing, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-primary mt-2 shrink-0" />
                <span className="text-sm">{ing}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="how-to-use">
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center shrink-0 font-medium">{i + 1}</span>
                <span className="text-sm leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-8">
          {/* Rating summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{product.rating.toFixed(1)}</div>
              <div className="flex justify-center mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
            </div>
            <div className="space-y-1">
              {breakdown.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={product.reviews.length} />
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand-primary">
                        {review.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.user.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    {review.verified && <Badge variant="secondary" className="text-xs text-green-600">Verified Purchase</Badge>}
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{review.title}</p>
                  <p className="text-sm text-muted-foreground">{review.body}</p>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-3 w-3" />Helpful ({review.helpfulCount})
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Write review form */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            {!session ? (
              <p className="text-muted-foreground">
                <Link href="/login" className="text-brand-primary hover:underline">Login</Link> to write a review.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <Label>Your Rating</Label>
                  <StarSelector value={reviewRating} onChange={setReviewRating} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="review-title">Review Title</Label>
                  <Input id="review-title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Sum up your experience" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="review-body">Your Review</Label>
                  <Textarea id="review-body" value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="What did you like or dislike?" rows={4} required />
                </div>
                <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={submittingReview}>
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </Button>
              </form>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={{ ...p, reviewCount: p.reviewCount } as Parameters<typeof ProductCard>[0]['product']} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
