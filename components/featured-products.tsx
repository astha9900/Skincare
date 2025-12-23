"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/mock-data"
import { ProductCard } from "./product-card"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("products")
    if (stored) {
      const allProducts = JSON.parse(stored)
      setProducts(allProducts.slice(0, 4))
    }
  }, [])

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground text-lg">Best-selling skincare essentials</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
