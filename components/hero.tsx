import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Image
        src="/home-hero-skincare.png"
        alt="Premium skincare products arranged on a bright vanity"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/78 to-background/10" />
      <div className="relative container mx-auto flex min-h-[calc(100vh-4rem)] items-center px-4 py-16">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-brand-primary backdrop-blur">
            <Sparkles className="h-4 w-4" />
            335+ skincare picks across trusted brands
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Discover Your Perfect Skincare
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
            Shop premium skincare, hair care, body care, and SPF essentials from brands customers already trust.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              <Link href="/products">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/70 backdrop-blur">
              <Link href="#routine-builder">Build Routine</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6 text-sm">
            <div><p className="text-2xl font-bold">25+</p><p className="text-muted-foreground">Brands</p></div>
            <div><p className="text-2xl font-bold">6</p><p className="text-muted-foreground">Categories</p></div>
            <div><p className="text-2xl font-bold">₹75+</p><p className="text-muted-foreground">Price range</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}
