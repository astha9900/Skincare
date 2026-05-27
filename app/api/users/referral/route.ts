import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

function generateCode(name: string, id: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X')
  const suffix = id.slice(-4).toUpperCase()
  return `${prefix}${suffix}`
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const userName = (session.user as { name?: string }).name ?? 'USER'

    // Ensure user has a referral code
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referralCode: true, name: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (!user.referralCode) {
      const code = generateCode(userName, userId)
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { id: true, referralCode: true, name: true },
      })
    }

    // Count referred users
    const referralCount = await prisma.user.count({
      where: { referredBy: user.referralCode! },
    })

    // Sum wallet credits from referrals
    const wallet = await prisma.skinWallet.findUnique({ where: { userId } })
    const referralEarnings = await prisma.walletTransaction.aggregate({
      where: { wallet: { userId }, type: 'REFERRAL' },
      _sum: { amount: true },
    })

    return NextResponse.json({
      code: user.referralCode,
      referralCount,
      totalEarned: referralEarnings._sum.amount ?? 0,
      walletBalance: wallet?.balance ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch referral info' }, { status: 500 })
  }
}
