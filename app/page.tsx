import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { Categories } from '@/components/categories'
import { WhyChooseUs } from '@/components/why-choose-us'
import { CustomerReviews } from '@/components/customer-reviews'
import { FeaturedProductsSection } from '@/components/featured-products'
import { PromoBanner } from '@/components/promo-banner'
import { NewsletterSection } from '@/components/newsletter-section'
import { QuizPromptBanner } from '@/components/quiz-prompt-banner'
import { ForYouSection } from '@/components/for-you-section'
import {
  BrandDiscoverySection,
  CategoryStorySection,
  ConcernShopSection,
  GlowOfferSection,
  RoutineBuilderSection,
  TrustStrip,
} from '@/components/homepage-sections'
import { calculateMatchScore } from '@/lib/quiz-engine'

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  let forYouProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  let userProfile: { skinType: string | null; skinConcerns: string[]; hairType: string | null } | null = null

  if (process.env.POSTGRES_PRISMA_URL) {
    try {
      featured = await prisma.product.findMany({
        where: { inStock: true },
        orderBy: { rating: 'desc' },
        take: 8,
      })

      const session = await auth()
      if (session?.user) {
        const userId = (session.user as { id?: string }).id
        if (userId) {
          const profile = await prisma.userProfile.findUnique({ where: { userId } }).catch(() => null)
          if (profile) {
            userProfile = { skinType: profile.skinType, skinConcerns: profile.skinConcerns, hairType: profile.hairType }
            const skinLow = profile.skinType?.toLowerCase() ?? ''
            const hairLow = profile.hairType?.toLowerCase() ?? ''
            const allConcerns = [...profile.skinConcerns, ...profile.hairConcerns, ...profile.bodyConcerns]
            const candidates = await prisma.product.findMany({
              where: {
                inStock: true,
                OR: [
                  { suitableForSkin: { hasSome: [skinLow, 'all'].filter(Boolean) } },
                  { suitableForHair: { hasSome: [hairLow, 'all'].filter(Boolean) } },
                  ...(allConcerns.length > 0 ? [{ targetConcerns: { hasSome: allConcerns } }] : []),
                ],
              } as Record<string, unknown>,
              orderBy: { rating: 'desc' },
              take: 20,
            })
            const profileForScore = {
              skinType: skinLow, hairType: hairLow,
              skinConcerns: profile.skinConcerns, hairConcerns: profile.hairConcerns,
              bodyConcerns: profile.bodyConcerns, budget: profile.budget?.toLowerCase() ?? null,
            }
            forYouProducts = candidates
              .map((p) => ({ ...p, matchScore: calculateMatchScore(p as Parameters<typeof calculateMatchScore>[0], profileForScore) }))
              .sort((a, b) => (b as { matchScore: number }).matchScore - (a as { matchScore: number }).matchScore)
              .slice(0, 5)
          }
        }
      }
    } catch {
      // DB connection failed — will show empty section
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <PromoBanner />
        <Categories />
        <FeaturedProductsSection products={featured} />
        {userProfile ? (
          <ForYouSection products={forYouProducts} profile={userProfile} />
        ) : (
          <QuizPromptBanner />
        )}
        <RoutineBuilderSection />
        <ConcernShopSection />
        <BrandDiscoverySection />
        <CategoryStorySection />
        <WhyChooseUs />
        <CustomerReviews />
        <GlowOfferSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
