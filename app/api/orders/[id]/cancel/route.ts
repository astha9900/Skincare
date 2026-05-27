import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userId = (session.user as { id: string }).id
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (order.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } })
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCount: { increment: item.quantity } },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}
