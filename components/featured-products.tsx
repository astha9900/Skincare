import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { ArrowRight } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; brand: string; category: string
  price: number; originalPrice?: number | null; discount?: number | null
  rating: number; reviewCount: number; image: string; inStock: boolean; stockCount: number
}

export function FeaturedProductsSection({ products }: { products: Product[] }) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Top-rated picks from India&apos;s best brands</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="hidden sm:flex">
              View All<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Products will appear here once the database is connected.</p>
            <Link href="/products"><Button variant="outline" className="mt-4">Browse All Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/products">
            <Button variant="outline">View All Products<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
