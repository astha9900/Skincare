import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

const brands = [
  'Mamaearth', 'Minimalist', 'WOW', 'Plum', 'Lakme', 'Dot & Key',
  'Neutrogena', 'The Derma Co', 'Himalaya', 'Biotique', 'Cosrx',
  'CeraVe', 'Olay', 'Kama Ayurveda', 'Forest Essentials', 'MCaffeine',
]

const collections = [
  ['Dermatologist-led', 'Minimalist, The Derma Co, CeraVe, Neutrogena'],
  ['Indian naturals', 'Mamaearth, Himalaya, Biotique, Kama Ayurveda'],
  ['K-beauty picks', 'Cosrx, Some By Mi, Innisfree, The Face Shop'],
]

export default function BrandsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-primary">Brands</p>
              <h1 className="mt-2 text-4xl font-bold">Shop trusted skincare brands</h1>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-7">Explore popular skincare, hair care, body care, and sun care labels across budget, active-led, natural, and luxury routines.</p>
            </div>
            <Button asChild className="w-fit bg-brand-primary hover:bg-brand-primary/90 text-white">
              <Link href="/products">View all products</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="rounded-lg border p-5 transition-colors hover:border-brand-primary hover:bg-brand-primary/5"
              >
                <p className="font-semibold">{brand}</p>
                <p className="mt-1 text-xs text-muted-foreground">Browse products</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {collections.map(([title, body]) => (
              <div key={title} className="rounded-lg bg-muted/50 p-6">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
