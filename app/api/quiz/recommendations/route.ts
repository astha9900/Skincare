import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { calculateMatchScore } from '@/lib/quiz-engine'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const profile = await prisma.userProfile.findUnique({ where: { userId } })
    if (!profile) return NextResponse.json([])

    const skinLow = profile.skinType?.toLowerCase() ?? ''
    const hairLow = profile.hairType?.toLowerCase() ?? ''
    const budgetLow = profile.budget?.toLowerCase() ?? null
    const allConcerns = [...profile.skinConcerns, ...profile.hairConcerns, ...profile.bodyConcerns]

    const where: Record<string, unknown> = {
      isActive: true,
      inStock: true,
      OR: [
        { suitableForSkin: { hasSome: [skinLow, 'all'].filter(Boolean) } },
        { suitableForHair: { hasSome: [hairLow, 'all'].filter(Boolean) } },
        ...(allConcerns.length > 0 ? [{ targetConcerns: { hasSome: allConcerns } }] : []),
      ],
    }

    if (budgetLow === 'budget') where.price = { lte: 299 }
    else if (budgetLow === 'mid') where.price = { gte: 300, lte: 799 }
    else if (budgetLow === 'premium') where.price = { gte: 800, lte: 1999 }
    else if (budgetLow === 'luxury') where.price = { gte: 2000 }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: 40,
    })

    const profileForScore = {
      skinType: skinLow,
      hairType: hairLow,
      skinConcerns: profile.skinConcerns,
      hairConcerns: profile.hairConcerns,
      bodyConcerns: profile.bodyConcerns,
      budget: budgetLow,
    }

    const scored = products
      .map((p) => ({ ...p, matchScore: calculateMatchScore(p as Parameters<typeof calculateMatchScore>[0], profileForScore) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20)

    return NextResponse.json(scored)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
