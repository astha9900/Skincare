import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This product doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex gap-3">
          <Link href="/products"><Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">Browse Products</Button></Link>
          <Link href="/"><Button variant="outline">Go Home</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
