import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { status, adminNote } = await req.json()

    const request = await prisma.returnRequest.update({
      where: { id },
      data: { status, adminNote },
      include: { order: true },
    })

    // If approved RETURN → credit wallet with order total
    if (status === 'APPROVED' && request.type === 'RETURN') {
      const wallet = await prisma.skinWallet.upsert({
        where: { userId: request.userId },
        update: { balance: { increment: request.order.total } },
        create: { userId: request.userId, balance: request.order.total },
      })
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: request.order.total,
          type: 'CREDIT',
          description: `Refund for order ${request.order.orderNumber}`,
          orderId: request.orderId,
        },
      })
      await prisma.order.update({ where: { id: request.orderId }, data: { status: 'REFUNDED' } })
    }

    return NextResponse.json(request)
  } catch {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
