import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      await prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } })
      return NextResponse.json({ added: false })
    }

    await prisma.wishlistItem.create({ data: { userId, productId } })
    return NextResponse.json({ added: true })
  } catch {
    return NextResponse.json({ error: 'Failed to toggle wishlist' }, { status: 500 })
  }
}
