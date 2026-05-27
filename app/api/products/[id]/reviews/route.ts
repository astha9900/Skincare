import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(100),
  body: z.string().min(10).max(1000),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: productId } = await params
    const userId = (session.user as { id: string }).id

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    // Check verified purchase
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: 'DELIVERED' },
      },
    })

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, ...parsed.data, verified: !!purchase },
      update: { ...parsed.data },
    })

    // Recalculate rating
    const agg = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true })
    await prisma.product.update({
      where: { id: productId },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
    })

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
