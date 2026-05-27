import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-[#f4fbf6] dark:bg-[#0c1710]">
          <div className="container mx-auto max-w-5xl px-4 py-14">
            <p className="text-sm font-medium text-brand-primary">About SkinGlow</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight">A skincare marketplace built for everyday routines</h1>
            <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">SkinGlow brings trusted skincare, hair care, body care, and sun care brands into one focused shopping experience. The goal is simple: help customers compare products clearly, choose confidently, and reorder without friction.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                <Link href="/products">Browse products</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/skin-guide">Read skin guide</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['335+', 'Seeded products across major skincare categories'],
              ['25+', 'Brands represented from budget to premium'],
              ['Secure', 'Checkout flow with saved addresses and order tracking'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border p-5">
                <p className="text-2xl font-bold text-brand-primary">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
