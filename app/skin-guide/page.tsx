import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Droplets, Moon, ShieldCheck, Sparkles } from 'lucide-react'

const routines = [
  { icon: Droplets, title: 'Cleanse', body: 'Use a gentle face wash that removes sunscreen, sweat, and pollution without leaving skin tight.' },
  { icon: Sparkles, title: 'Treat', body: 'Pick one active at a time: Vitamin C for dullness, Niacinamide for oil, Salicylic Acid for acne, Retinol for texture.' },
  { icon: Moon, title: 'Repair', body: 'Use a barrier-supporting moisturizer with ceramides, hyaluronic acid, aloe, or panthenol.' },
  { icon: ShieldCheck, title: 'Protect', body: 'Finish every morning routine with SPF 30 or SPF 50, even when you stay indoors near windows.' },
]

const concerns = [
  ['Acne-prone', 'Salicylic Acid cleanser, lightweight gel moisturizer, non-comedogenic SPF'],
  ['Dry skin', 'Cream cleanser, Hyaluronic Acid serum, ceramide moisturizer, dewy sunscreen'],
  ['Dullness', 'Vitamin C serum, gentle exfoliating toner, brightening moisturizer'],
  ['Aging care', 'Peptide serum, Retinol night treatment, nourishing eye cream'],
]

export default function SkinGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-[#f4fbf6] dark:bg-[#0c1710]">
          <div className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-brand-primary">Skin Guide</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">Build a routine that fits your skin, not the trend cycle.</h1>
              <p className="mt-5 max-w-xl text-muted-foreground leading-7">A simple, practical guide for choosing products by concern, routine step, and comfort level.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                  <Link href="/products">Shop Products</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/products?category=Sun%20Care">Find SPF</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Starter routine</p>
              <div className="mt-5 space-y-4">
                {routines.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-4 md:grid-cols-2">
            {concerns.map(([title, body]) => (
              <div key={title} className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold">{title}</h2>
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
