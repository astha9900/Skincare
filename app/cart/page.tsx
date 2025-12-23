"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCart, updateCartItemQuantity, removeFromCart } from "@/lib/cart"
import type { Product } from "@/lib/mock-data"
import { Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default function CartPage() {
  const [cartItems, setCartItems] = useState(getCart())
  const [products, setProducts] = useState<Product[]>([])
  const router = useRouter()

  useEffect(() => {
    setCartItems(getCart())
    const stored = localStorage.getItem("products")
    if (stored) {
      setProducts(JSON.parse(stored))
    }
  }, [])

  const cartProducts = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...product, quantity: item.quantity } : null
    })
    .filter((item): item is Product & { quantity: number } => item !== null)

  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateCartItemQuantity(productId, newQuantity)
    setCartItems(getCart())
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const handleRemove = (productId: string) => {
    removeFromCart(productId)
    setCartItems(getCart())
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      router.push("/login?redirect=/checkout")
      return
    }
    router.push("/checkout")
  }

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground">Add some products to get started!</p>
            <Link href="/products">
              <Button className="bg-brand-primary hover:bg-brand-primary/90">Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                        <p className="font-bold">₹{item.price}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Order Summary</h2>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{subtotal}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                  <Link href="/products">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
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
