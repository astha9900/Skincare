import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm font-medium text-brand-primary">Support</p>
          <h1 className="mt-2 text-3xl font-bold">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">For order help, vendor questions, returns, or product support, reach out through any of the channels below.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a href="mailto:singhastha614@gmail.com" className="rounded-lg border p-5 transition-colors hover:border-brand-primary hover:bg-brand-primary/5">
              <Mail className="h-5 w-5 text-brand-primary" />
              <h2 className="mt-4 font-semibold">Email</h2>
              <p className="mt-1 text-sm text-muted-foreground">singhastha614@gmail.com</p>
            </a>
            <a href="tel:+919661644321" className="rounded-lg border p-5 transition-colors hover:border-brand-primary hover:bg-brand-primary/5">
              <Phone className="h-5 w-5 text-brand-primary" />
              <h2 className="mt-4 font-semibold">Phone</h2>
              <p className="mt-1 text-sm text-muted-foreground">+91 9661644321</p>
            </a>
            <div className="rounded-lg border p-5">
              <MapPin className="h-5 w-5 text-brand-primary" />
              <h2 className="mt-4 font-semibold">Service Area</h2>
              <p className="mt-1 text-sm text-muted-foreground">Shipping across India</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
