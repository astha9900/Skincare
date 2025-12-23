import { CATEGORIES } from "@/lib/mock-data"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function Categories() {
  return (
    <section id="categories" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Find the perfect products for your skin needs</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <Link key={category.name} href={`/products?category=${encodeURIComponent(category.name)}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="aspect-square rounded-full overflow-hidden mb-3 bg-brand-light/50 group-hover:scale-105 transition-transform">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} products</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
