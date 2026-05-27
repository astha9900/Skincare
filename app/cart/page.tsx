'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { getCart, updateCartItemQuantity, removeFromCart, type CartItem } from '@/lib/cart'
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, LogIn } from 'lucide-react'

const FREE_SHIPPING_THRESHOLD = 499
const SHIPPING_COST = 49

interface CartProduct extends CartItem {
  brand?: string
  category?: string
  inStock?: boolean
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<CartProduct[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; discount: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    const cart = getCart()
    // Hydrate from API if items have IDs but no names
    const missing = cart.filter((i) => !i.name)
    if (missing.length > 0) {
      Promise.all(
        missing.map((i) => fetch(`/api/products/${i.productId}`).then((r) => r.json()).catch(() => null))
      ).then((products) => {
        const enriched = cart.map((item) => {
          const p = products.find((pr) => pr?.id === item.productId)
          return p ? { ...item, name: p.name, image: p.image, price: p.price, brand: p.brand, category: p.category, inStock: p.inStock } : item
        })
        setItems(enriched)
      })
    } else {
      setItems(cart)
    }
  }, [])

  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
  const discount = appliedCoupon?.discountAmount ?? 0
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal - discount + shipping

  const handleQty = (productId: string, newQty: number) => {
    if (newQty < 1) return
    updateCartItemQuantity(productId, newQty)
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: newQty } : i))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemove = (productId: string, name?: string) => {
    removeFromCart(productId)
    setItems((prev) => prev.filter((i) => i.productId !== productId))
    window.dispatchEvent(new Event('cartUpdated'))
    toast({ title: 'Removed', description: `${name} removed from cart` })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal }),
    })
    const data = await res.json()
    setCouponLoading(false)
    if (data.valid) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discountAmount: data.discountAmount, discount: data.discount })
      toast({ title: data.message })
    } else {
      toast({ title: data.message, variant: 'destructive' })
    }
  }

  const handleCheckout = () => {
    if (!session) { router.push('/login?redirect=/checkout'); return }
    if (appliedCoupon) sessionStorage.setItem('coupon', JSON.stringify(appliedCoupon))
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/30" />
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/products"><Button className="bg-brand-primary hover:bg-brand-primary/90">Browse Products</Button></Link>
              {session && <Link href="/wishlist"><Button variant="outline">View Wishlist</Button></Link>}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const freeShippingProgress = Math.min(100, ((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discount))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image src={item.image || '/placeholder.jpg'} alt={item.name ?? 'Product'} fill className="object-cover" sizes="96px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                        {item.brand && <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>}
                        <p className="font-bold mt-1">₹{item.price}</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Line total: ₹{((item.price ?? 0) * item.quantity).toFixed(0)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(item.productId, item.name)} aria-label="Remove item">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="flex items-center border rounded-lg">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQty(item.productId, item.quantity - 1)} aria-label="Decrease quantity">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQty(item.productId, item.quantity + 1)} aria-label="Increase quantity">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Coupon */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Tag className="h-4 w-4" />Apply Coupon</h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">{appliedCoupon.code} applied</p>
                        <p className="text-xs text-green-600 dark:text-green-500">You save ₹{appliedCoupon.discountAmount}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setAppliedCoupon(null)} aria-label="Remove coupon">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="uppercase" />
                      <Button onClick={handleApplyCoupon} disabled={couponLoading} variant="outline">
                        {couponLoading ? '…' : 'Apply'}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Try: SAVE10, FIRST20, FLAT100, SKINCARE50</p>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Order Summary</h2>

                  {/* Free shipping progress */}
                  {remaining > 0 && (
                    <div className="space-y-1">
                      <Progress value={freeShippingProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">Add ₹{remaining} more for FREE shipping</p>
                    </div>
                  )}
                  {remaining === 0 && (
                    <p className="text-xs text-green-600 font-medium">You qualify for FREE shipping!</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600"><span>Coupon discount</span><span>−₹{discount}</span></div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-base font-bold">
                      <span>Total</span><span>₹{total.toFixed(0)}</span>
                    </div>
                  </div>

                  {!session ? (
                    <div className="space-y-2">
                      <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Login required to checkout</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Sign in to place your order</p>
                      </div>
                      <Link href="/login?redirect=/checkout" className="block">
                        <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" size="lg">
                          <LogIn className="mr-2 h-4 w-4" />Login to Checkout
                        </Button>
                      </Link>
                      <Link href="/signup" className="block">
                        <Button variant="outline" className="w-full">Create Account</Button>
                      </Link>
                    </div>
                  ) : (
                    <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white" size="lg" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                  )}
                  <Link href="/products">
                    <Button variant="outline" className="w-full">Continue Shopping</Button>
                  </Link>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    {['COD', 'UPI', 'Card'].map((m) => (
                      <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
