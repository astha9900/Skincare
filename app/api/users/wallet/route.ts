import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const wallet = await prisma.skinWallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    })

    if (!wallet) return NextResponse.json({ balance: 0, transactions: [] })
    return NextResponse.json(wallet)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
  }
}

const topUpSchema = z.object({
  amount: z.number().int().min(10).max(10000),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const body = await req.json()
    const parsed = topUpSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const { amount } = parsed.data

    const wallet = await prisma.$transaction(async (tx) => {
      const w = await tx.skinWallet.upsert({
        where: { userId },
        create: { userId, balance: amount },
        update: { balance: { increment: amount } },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: w.id,
          amount,
          type: 'TOPUP',
          description: `Added ₹${amount} to Skin Wallet`,
        },
      })
      return tx.skinWallet.findUnique({
        where: { userId },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
      })
    })

    return NextResponse.json(wallet)
  } catch {
    return NextResponse.json({ error: 'Failed to add money' }, { status: 500 })
  }
}
