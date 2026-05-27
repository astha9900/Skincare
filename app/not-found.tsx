import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-8xl font-bold text-brand-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link href="/"><Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">Go Home</Button></Link>
          <Link href="/products"><Button variant="outline">Browse Products</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
