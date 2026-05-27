import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductDetailClient } from './product-detail-client'
import { calculateMatchScore, getMatchReasons } from '@/lib/quiz-engine'

export const revalidate = 3600

interface Props { params: Promise<{ id: string }> }

async function getProduct(id: string) {
  return prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: [product.image] },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const [related, matchData] = await Promise.all([
    prisma.product.findMany({
      where: { category: product.category, id: { not: product.id } },
      take: 4,
    }),
    (async () => {
      try {
        const session = await auth()
        if (!session?.user) return null
        const userId = (session.user as { id?: string }).id
        if (!userId) return null
        const profile = await prisma.userProfile.findUnique({ where: { userId } })
        if (!profile) return null
        const profileForScore = {
          skinType: profile.skinType?.toLowerCase() ?? '',
          hairType: profile.hairType?.toLowerCase() ?? '',
          skinConcerns: profile.skinConcerns,
          hairConcerns: profile.hairConcerns,
          bodyConcerns: profile.bodyConcerns,
          budget: profile.budget?.toLowerCase() ?? null,
        }
        const score = calculateMatchScore(product as Parameters<typeof calculateMatchScore>[0], profileForScore)
        const reasons = getMatchReasons(product as Parameters<typeof getMatchReasons>[0], profileForScore)
        return { score, reasons }
      } catch {
        return null
      }
    })(),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {matchData && matchData.score > 30 && (
          <div className="container mx-auto px-4 pt-6 max-w-6xl">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-green-600 text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {matchData.score > 60 ? 'Perfect match for you' : 'Good match for you'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  {matchData.reasons.slice(0, 2).join(' · ')}
                </p>
              </div>
            </div>
          </div>
        )}
        <ProductDetailClient product={product as Parameters<typeof ProductDetailClient>[0]['product']} related={related} />
      </main>
      <Footer />
    </div>
  )
}
