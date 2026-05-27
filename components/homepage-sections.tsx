import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Droplets, Leaf, ShieldCheck, Sparkles, Sun, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const trustItems = [
  { icon: BadgeCheck, label: 'Verified sellers', detail: 'Authentic products only' },
  { icon: Truck, label: 'Fast shipping', detail: 'Delivery across India' },
  { icon: ShieldCheck, label: 'Secure checkout', detail: 'Protected order flow' },
  { icon: Sparkles, label: 'Routine-ready', detail: 'Shop by concern' },
]

const steps = [
  ['01', 'Cleanse', 'Remove SPF, oil, and city dust without stripping your skin.'],
  ['02', 'Treat', 'Choose actives for acne, dullness, pigmentation, or texture.'],
  ['03', 'Moisturize', 'Lock hydration with gel, cream, or barrier repair formulas.'],
  ['04', 'Protect', 'Finish every morning with SPF 30, SPF 50, or tinted sunscreen.'],
]

const concerns = [
  { title: 'Acne & Oil Control', href: '/products?category=Acne%20Care', icon: Droplets, copy: 'BHA, niacinamide, spot gels, and calming cica care.' },
  { title: 'Brightening', href: '/products?tags=vitamin-c', icon: Sparkles, copy: 'Vitamin C, alpha arbutin, kojic acid, and glow creams.' },
  { title: 'Sun Protection', href: '/products?category=Sun%20Care', icon: Sun, copy: 'Lightweight SPF, tinted sunscreen, and reapplication sticks.' },
  { title: 'Natural Care', href: '/products?brand=Mamaearth', icon: Leaf, copy: 'Aloe, ubtan, turmeric, sandalwood, and gentle daily picks.' },
]

const brandRows = [
  ['Minimalist', 'The Derma Co', 'CeraVe', 'Neutrogena'],
  ['Mamaearth', 'WOW', 'Plum', 'Dot & Key'],
  ['Cosrx', 'Some By Mi', 'Innisfree', 'The Face Shop'],
]

const categories = [
  ['Face Care', 'Serums, cleansers, moisturizers, toners, masks'],
  ['Hair Care', 'Oils, shampoos, conditioners, masks, scalp serums'],
  ['Body Care', 'Lotions, washes, scrubs, butters, hand and foot care'],
  ['Anti-Aging', 'Retinol, peptides, night creams, eye creams'],
  ['Acne Care', 'BHA, spot treatments, gel cleansers, cica formulas'],
  ['Sun Care', 'SPF 30, SPF 50, mineral, tinted, and after-sun care'],
]

export function TrustStrip() {
  return (
    <section className="border-y bg-background">
      <div className="container mx-auto grid gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function RoutineBuilderSection() {
  return (
    <section id="routine-builder" className="py-16">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <Image
            src="/home-routine-flatlay.png"
            alt="Daily skincare routine products arranged on a counter"
            fill
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-primary">Routine Builder</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Four steps. Better decisions. Less shelf confusion.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Build a complete AM or PM routine from products that match your concern, texture preference, and budget.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {steps.map(([number, title, body]) => (
              <div key={title} className="rounded-lg border p-5">
                <p className="text-sm font-semibold text-brand-primary">{number}</p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-7 bg-brand-primary hover:bg-brand-primary/90 text-white">
            <Link href="/skin-guide">
              Read Skin Guide <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function ConcernShopSection() {
  return (
    <section className="bg-muted/35 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-primary">Shop by Concern</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Start with what your skin needs today</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Browse all products</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concerns.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.title} href={item.href} className="rounded-lg border bg-background p-6 transition-colors hover:border-brand-primary hover:bg-brand-primary/5">
                <Icon className="h-6 w-6 text-brand-primary" />
                <h3 className="mt-5 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function BrandDiscoverySection() {
  return (
    <section className="py-16">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-brand-primary">Brand Discovery</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">From dermatologist-led actives to natural Indian staples</h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Compare brands by routine style, ingredient philosophy, and price point without jumping between stores.
          </p>
          <div className="mt-8 space-y-3">
            {brandRows.map((row, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                {row.map((brand) => (
                  <Link key={brand} href={`/products?brand=${encodeURIComponent(brand)}`} className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-brand-primary hover:text-brand-primary">
                    {brand}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <Button asChild className="mt-7 bg-brand-primary hover:bg-brand-primary/90 text-white">
            <Link href="/brands">
              Explore Brands <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <Image
            src="/home-category-collage.png"
            alt="Marketplace display of skincare, hair care, body care, and sunscreen products"
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export function CategoryStorySection() {
  return (
    <section className="bg-[#f4fbf6] py-16 dark:bg-[#0c1710]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-primary">Marketplace Coverage</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Everything for face, hair, body, sun, acne, and aging care</h2>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
          {categories.map(([title, body]) => (
            <Link key={title} href={`/products?category=${encodeURIComponent(title)}`} className="bg-background p-6 transition-colors hover:bg-brand-primary/5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function GlowOfferSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-lg border bg-brand-primary text-white">
          <div className="grid gap-8 p-8 md:grid-cols-[1fr_0.8fr] md:items-center md:p-10">
            <div>
              <p className="text-sm font-semibold text-white/80">SkinGlow Promise</p>
              <h2 className="mt-2 text-3xl font-bold">Routine help, real products, and checkout that gets out of your way.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/80">
                Free shipping over ₹499, secure checkout, saved addresses, wishlists, and order tracking are built into the shopping flow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button asChild className="bg-white text-brand-primary hover:bg-white/90">
                <Link href="/products">Start Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/shipping-returns">Shipping Info</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
