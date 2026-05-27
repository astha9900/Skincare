import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm font-medium text-brand-primary">Legal</p>
          <h1 className="mt-2 text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">Last updated: May 26, 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
              <p className="mt-2">SkinGlow collects account details, delivery addresses, order history, wishlist activity, and support messages so we can process orders, personalize shopping, prevent misuse, and respond to requests.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">How We Use Data</h2>
              <p className="mt-2">We use your data to operate checkout, deliver orders, manage returns, improve recommendations, send service updates, and meet legal or tax obligations. We do not sell personal information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Payments</h2>
              <p className="mt-2">Payment details are handled through secure payment workflows. Card numbers, CVV, and UPI authorization credentials should not be stored by SkinGlow beyond the minimal confirmation data needed for your order.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Your Choices</h2>
              <p className="mt-2">You can update profile details, remove saved addresses, unsubscribe from promotional emails, or contact support for account deletion and data access requests.</p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
