"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { addToCart } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/mock-data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product.id)
    window.dispatchEvent(new Event("cartUpdated"))
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
        <CardContent className="p-4 flex-1">
          <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
            {product.discount && (
              <Badge className="absolute top-2 left-2 bg-brand-accent text-white">{product.discount}% OFF</Badge>
            )}
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-brand-primary font-medium">{product.brand}</p>
            <h3 className="font-semibold text-foreground line-clamp-2 text-balance">{product.name}</h3>

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
