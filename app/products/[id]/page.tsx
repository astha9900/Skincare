"use client"

import { useState, use, useEffect } from "react"
import type { Product } from "@/lib/mock-data"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ShoppingCart, Minus, Plus } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("products")
    if (stored) {
      const products: Product[] = JSON.parse(stored)
      const foundProduct = products.find((p) => p.id === resolvedParams.id)
      setProduct(foundProduct || null)
    }
  }, [resolvedParams.id])

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <Button onClick={() => router.push("/products")} className="bg-brand-primary hover:bg-brand-primary/90">
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
    window.dispatchEvent(new Event("cartUpdated"))
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    addToCart(product.id, quantity)
    window.dispatchEvent(new Event("cartUpdated"))
    router.push("/cart")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-brand-primary font-semibold mb-2">{product.brand}</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{product.name}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews} reviews)</span>
                  </div>
                  {product.inStock ? (
                    <Badge className="bg-green-500">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                      <Badge className="bg-brand-accent text-white">{product.discount}% OFF</Badge>
                    </>
                  )}
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <p className="text-muted-foreground">{product.ingredients}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">How to Use</h3>
                  <p className="text-muted-foreground">{product.howToUse}</p>
                </CardContent>
              </Card>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>

                <Button
                  className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-white"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
