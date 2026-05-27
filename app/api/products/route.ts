import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { calculateMatchScore } from '@/lib/quiz-engine'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') ?? 'popular'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(48, parseInt(searchParams.get('limit') ?? '12'))
    const inStock = searchParams.get('inStock')
    const recommended = searchParams.get('recommended') === 'true'
    const tags = searchParams.get('tags')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (brand) where.brand = brand
    if (inStock === 'true') where.inStock = true
    if (tags) where.tags = { hasSome: tags.split(',').map((t) => t.trim()).filter(Boolean) }
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    let recommendedSession = null
    let recommendedProfile = null
    if (recommended) {
      recommendedSession = await auth()
      if (recommendedSession) {
        const userId = (recommendedSession.user as { id: string }).id
        recommendedProfile = await prisma.userProfile.findUnique({ where: { userId } })
        if (recommendedProfile) {
          const skinLow = recommendedProfile.skinType?.toLowerCase() ?? ''
          const hairLow = recommendedProfile.hairType?.toLowerCase() ?? ''
          const allConcerns = [...recommendedProfile.skinConcerns, ...recommendedProfile.hairConcerns, ...recommendedProfile.bodyConcerns]
          const orClauses = [
            { suitableForSkin: { hasSome: [skinLow, 'all'].filter(Boolean) } },
            { suitableForHair: { hasSome: [hairLow, 'all'].filter(Boolean) } },
            ...(allConcerns.length > 0 ? [{ targetConcerns: { hasSome: allConcerns } }] : []),
          ]
          where.OR = where.OR ? [...(where.OR as unknown[]), ...orClauses] : orClauses
        }
      }
    }

    const orderBy: Record<string, string> =
      sort === 'price-asc' ? { price: 'asc' }
      : sort === 'price-desc' ? { price: 'desc' }
      : sort === 'newest' ? { createdAt: 'desc' }
      : sort === 'rating-desc' ? { rating: 'desc' }
      : { reviewCount: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      prisma.product.count({ where }),
    ])

    if (recommended && recommendedSession && recommendedProfile) {
      const profileForScore = {
        skinType: recommendedProfile.skinType?.toLowerCase() ?? '',
        hairType: recommendedProfile.hairType?.toLowerCase() ?? '',
        skinConcerns: recommendedProfile.skinConcerns,
        hairConcerns: recommendedProfile.hairConcerns,
        bodyConcerns: recommendedProfile.bodyConcerns,
        budget: recommendedProfile.budget?.toLowerCase() ?? null,
      }
      const scored = products
        .map((p) => ({ ...p, matchScore: calculateMatchScore(p as Parameters<typeof calculateMatchScore>[0], profileForScore) }))
        .sort((a, b) => b.matchScore - a.matchScore)
      return NextResponse.json({ products: scored, total, page, totalPages: Math.ceil(total / limit) })
    }

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  description: z.string().min(1),
  ingredients: z.string().default(''),
  howToUse: z.string().default(''),
  image: z.string().min(1),
  images: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  stockCount: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const role = (session?.user as { role?: string })?.role
    if (!session || !['ADMIN', 'VENDOR'].includes(role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const vendorId = role === 'VENDOR' ? (session.user as { id: string }).id : undefined
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
        images: parsed.data.images ?? [parsed.data.image],
        ...(vendorId ? { vendorId } : {}),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
