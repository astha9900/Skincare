import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-brand-light via-background to-brand-accent/10 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Discover Your Perfect Skincare
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl">
              Shop premium skincare products from India's most trusted brands. Natural, effective, and affordable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/products">
                <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto">
                  Shop Now
                </Button>
              </Link>
              <Link href="#categories">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <img src="/natural-skincare-products-hero.jpg" alt="Skincare Products" className="rounded-2xl shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
