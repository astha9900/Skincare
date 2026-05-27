import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm font-medium text-brand-primary">Legal</p>
          <h1 className="mt-2 text-3xl font-bold">Terms & Conditions</h1>
          <p className="mt-3 text-muted-foreground">Last updated: May 26, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">Using SkinGlow</h2>
              <p className="mt-2">By using SkinGlow, you agree to provide accurate account, delivery, and payment information. You are responsible for activity under your account and for keeping your login details secure.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Product Information</h2>
              <p className="mt-2">We try to keep product details, prices, stock, and offers accurate. Skincare results vary by person, and product descriptions are not medical advice.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Orders & Cancellations</h2>
              <p className="mt-2">Orders may be cancelled if payment fails, stock is unavailable, address details are invalid, or fraud checks require it. Refunds are processed according to the payment method and return eligibility.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Marketplace Sellers</h2>
              <p className="mt-2">Some products may be fulfilled by vendor partners. Vendors are expected to meet SkinGlow quality, packaging, and fulfilment standards.</p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
