import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { calculateMatchScore } from '@/lib/quiz-engine'

const schema = z.object({
  skinType: z.enum(['OILY', 'DRY', 'COMBINATION', 'SENSITIVE', 'NORMAL']).optional(),
  skinConcerns: z.array(z.string()).default([]),
  hairType: z.enum(['STRAIGHT', 'WAVY', 'CURLY', 'COILY']).optional(),
  hairConcerns: z.array(z.string()).default([]),
  bodyConcerns: z.array(z.string()).default([]),
  age: z.enum(['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES_PLUS']).optional(),
  budget: z.enum(['BUDGET', 'MID', 'PREMIUM', 'LUXURY']).optional(),
  routine: z.enum(['MINIMAL', 'MODERATE', 'EXTENSIVE']).optional(),
})

// Map quiz answers → product categories and keyword hints
const SKIN_CONCERN_CATEGORIES: Record<string, string[]> = {
  acne: ['Acne Care', 'Face Care'],
  'dark-spots': ['Face Care', 'Sun Care'],
  dullness: ['Face Care'],
  'anti-aging': ['Anti-Aging', 'Face Care'],
  hydration: ['Face Care'],
  pores: ['Face Care', 'Acne Care'],
  redness: ['Face Care'],
  tan: ['Sun Care', 'Face Care'],
  'oily-skin': ['Acne Care', 'Face Care'],
}

const HAIR_CONCERN_CATEGORIES: Record<string, string> = {
  'hair-fall': 'Hair Care',
  dandruff: 'Hair Care',
  frizz: 'Hair Care',
  growth: 'Hair Care',
  damage: 'Hair Care',
  'oily-scalp': 'Hair Care',
  'dry-scalp': 'Hair Care',
  volume: 'Hair Care',
}

const BODY_CONCERN_CATEGORIES: Record<string, string> = {
  'dry-body': 'Body Care',
  'body-tan': 'Body Care',
  'body-acne': 'Body Care',
  'stretch-marks': 'Body Care',
  cellulite: 'Body Care',
  'rough-elbows': 'Body Care',
  none: 'Body Care',
}

// Concern → keywords to search in product name / tags / description
const CONCERN_KEYWORDS: Record<string, string[]> = {
  acne: ['acne', 'salicylic', 'benzoyl', 'niacinamide', 'bha', 'pore'],
  'dark-spots': ['vitamin c', 'kojic', 'niacinamide', 'dark spot', 'pigment', 'brightening'],
  dullness: ['vitamin c', 'brightening', 'glow', 'radiance', 'exfoliat'],
  'anti-aging': ['retinol', 'anti-aging', 'anti aging', 'peptide', 'collagen', 'wrinkle'],
  hydration: ['hyaluronic', 'moisturiz', 'hydrat', 'ceramide', 'squalane'],
  pores: ['niacinamide', 'pore', 'bha', 'salicylic', 'toner'],
  redness: ['calming', 'centella', 'sensitive', 'aloe', 'ceramide', 'gentle'],
  tan: ['sunscreen', 'spf', 'de-tan', 'tan', 'vitamin c'],
  'oily-skin': ['oil control', 'mattify', 'niacinamide', 'clay', 'salicylic'],
  'hair-fall': ['hair fall', 'onion', 'biotin', 'hair growth', 'keratin', 'castor'],
  dandruff: ['dandruff', 'anti-dandruff', 'ketoconazole', 'zinc'],
  frizz: ['frizz', 'keratin', 'argan', 'smoothing', 'anti-frizz'],
  growth: ['hair growth', 'rosemary', 'minoxidil', 'biotin', 'onion'],
  damage: ['repair', 'keratin', 'protein', 'damage', 'bond'],
  'oily-scalp': ['oil control', 'scalp', 'clarifying', 'apple cider'],
  'dry-scalp': ['scalp', 'moistur', 'dry scalp', 'coconut', 'argan'],
  volume: ['volume', 'volumizing', 'thicken'],
  'dry-body': ['body lotion', 'shea', 'butter', 'moisturizing body'],
  'body-tan': ['body', 'de-tan', 'vitamin c'],
  'body-acne': ['body wash', 'salicylic', 'tea tree'],
  'stretch-marks': ['stretch mark', 'rosehip', 'bio oil'],
  cellulite: ['coffee', 'caffeine', 'scrub'],
  'rough-elbows': ['exfoliating', 'scrub', 'aha', 'lactic'],
}

const SKIN_TYPE_KEYWORDS: Record<string, string[]> = {
  oily: ['oily', 'oil control', 'mattif', 'non-comedogenic', 'lightweight'],
  dry: ['dry', 'moisturiz', 'hydrat', 'nourish', 'rich cream'],
  combination: ['combination', 'balance', 'hydrat'],
  sensitive: ['sensitive', 'gentle', 'fragrance-free', 'calming', 'soothing'],
  normal: ['all skin', 'daily', 'cleanser', 'moisturizer'],
}

async function getRecommendedProducts(
  skinType: string,
  skinConcerns: string[],
  hairConcerns: string[],
  bodyConcerns: string[],
  budget: string | null,
) {
  // Determine which categories are relevant
  const relevantCategories = new Set<string>()

  if (skinType || skinConcerns.length > 0) {
    relevantCategories.add('Face Care')
    relevantCategories.add('Sun Care')
    skinConcerns.forEach((c) => {
      SKIN_CONCERN_CATEGORIES[c]?.forEach((cat) => relevantCategories.add(cat))
    })
  }
  hairConcerns.forEach((c) => {
    if (HAIR_CONCERN_CATEGORIES[c]) relevantCategories.add(HAIR_CONCERN_CATEGORIES[c])
  })
  bodyConcerns.forEach((c) => {
    if (BODY_CONCERN_CATEGORIES[c]) relevantCategories.add(BODY_CONCERN_CATEGORIES[c])
  })

  if (relevantCategories.size === 0) relevantCategories.add('Face Care')

  const allConcerns = [...skinConcerns, ...hairConcerns, ...bodyConcerns]

  // Budget filter
  const budgetWhere: Record<string, unknown> = {}
  if (budget === 'budget') budgetWhere.price = { lte: 299 }
  else if (budget === 'mid') budgetWhere.price = { gte: 300, lte: 799 }
  else if (budget === 'premium') budgetWhere.price = { gte: 800, lte: 1999 }
  else if (budget === 'luxury') budgetWhere.price = { gte: 2000 }

  // Step 1: try tag-based matching
  const tagBased = await prisma.product.findMany({
    where: {
      inStock: true,
      ...budgetWhere,
      OR: [
        ...(skinType ? [{ suitableForSkin: { hasSome: [skinType, 'all'] } }] : []),
        ...(allConcerns.length > 0 ? [{ targetConcerns: { hasSome: allConcerns } }] : []),
      ],
    } as Record<string, unknown>,
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: 40,
  })

  if (tagBased.length >= 5) return tagBased

  // Step 2: keyword + category fallback — build keyword list from concerns
  const keywords = new Set<string>()
  allConcerns.forEach((c) => CONCERN_KEYWORDS[c]?.forEach((k) => keywords.add(k)))
  if (skinType) SKIN_TYPE_KEYWORDS[skinType]?.forEach((k) => keywords.add(k))

  const kwArray = Array.from(keywords)

  // Fetch by category first, then keyword-filter or just return top-rated
  const categoryProducts = await prisma.product.findMany({
    where: {
      inStock: true,
      ...budgetWhere,
      category: { in: Array.from(relevantCategories) },
    } as Record<string, unknown>,
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: 60,
  })

  if (categoryProducts.length === 0) {
    // Last resort: top-rated products overall
    return prisma.product.findMany({
      where: { inStock: true, ...budgetWhere } as Record<string, unknown>,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: 20,
    })
  }

  if (kwArray.length === 0) return categoryProducts.slice(0, 20)

  // Score by keyword matches in name/description/tags
  const scored = categoryProducts.map((p) => {
    const text = `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase()
    const kwScore = kwArray.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0)
    return { ...p, _kwScore: kwScore }
  })

  scored.sort((a, b) => {
    if (b._kwScore !== a._kwScore) return b._kwScore - a._kwScore
    return b.rating - a.rating
  })

  return scored.slice(0, 20)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const data = parsed.data
    const skinLow = data.skinType?.toLowerCase() ?? ''
    const hairLow = data.hairType?.toLowerCase() ?? ''
    const budgetLow = data.budget?.toLowerCase() ?? null

    const products = await getRecommendedProducts(
      skinLow,
      data.skinConcerns,
      data.hairConcerns,
      data.bodyConcerns,
      budgetLow,
    )

    const profileForScore = {
      skinType: skinLow,
      hairType: hairLow,
      skinConcerns: data.skinConcerns,
      hairConcerns: data.hairConcerns,
      bodyConcerns: data.bodyConcerns,
      budget: budgetLow,
    }

    const scored = products
      .map((p) => ({ ...p, matchScore: calculateMatchScore(p as Parameters<typeof calculateMatchScore>[0], profileForScore) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12)

    return NextResponse.json({ recommendedProducts: scored, saved: false })
  } catch {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const profile = await prisma.userProfile.findUnique({ where: { userId } })
    return NextResponse.json(profile ?? null)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
