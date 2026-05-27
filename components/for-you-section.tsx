import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; brand: string; image: string
  price: number; originalPrice?: number | null; rating: number
}

interface UserProfileLike {
  skinType: string | null
  skinConcerns: string[]
  hairType: string | null
}

interface Props {
  products: Product[]
  profile: UserProfileLike
}

const SKIN_LABELS: Record<string, string> = {
  OILY: 'Oily', DRY: 'Dry', COMBINATION: 'Combination', SENSITIVE: 'Sensitive', NORMAL: 'Normal',
}

export function ForYouSection({ products, profile }: Props) {
  const chips = [
    profile.skinType ? SKIN_LABELS[profile.skinType] + ' skin' : null,
    ...profile.skinConcerns.slice(0, 2),
  ].filter(Boolean) as string[]

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-pink-500" />
              <h2 className="text-2xl font-bold">Picked For You</h2>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {chips.map((c) => (
                <Badge key={c} className="bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-0 text-xs capitalize">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/skin-quiz" className="text-xs text-muted-foreground hover:text-pink-500 underline">
              Retake quiz
            </Link>
            <Button asChild size="sm" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              <Link href="/products?recommended=true">View all</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="rounded-xl overflow-hidden border bg-card hover:border-pink-300 transition-colors hover:shadow-sm">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={p.image || '/placeholder.jpg'}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">For You</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                  <p className="text-sm font-medium line-clamp-2 leading-tight mt-0.5">{p.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-brand-primary">₹{p.price}</span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-xs text-muted-foreground line-through">₹{p.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
