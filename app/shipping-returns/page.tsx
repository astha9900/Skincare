import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm font-medium text-brand-primary">Support</p>
          <h1 className="mt-2 text-3xl font-bold">Shipping & Returns</h1>
          <p className="mt-3 text-muted-foreground">Simple delivery timelines and return rules for SkinGlow orders.</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Shipping</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Most orders are packed within 24 hours and delivered in 3-7 business days depending on your pincode and seller location. Orders above ₹499 qualify for free shipping.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Returns</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Unopened products can be returned within 7 days of delivery. Damaged or incorrect products should be reported with photos within 48 hours.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Refunds</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Refunds are initiated after return inspection and usually reflect within 5-7 business days depending on your bank or payment provider.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Non-returnable Items</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Opened, used, tampered, or hygiene-sensitive products cannot be returned unless they arrived damaged or incorrect.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
