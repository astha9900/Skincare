import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const REFERRAL_BONUS = 100 // ₹100 for both referrer and new user

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
})

function generateCode(name: string, id: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X')
  const suffix = id.slice(-4).toUpperCase()
  return `${prefix}${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { name, email, password, referralCode } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    // Validate referral code if provided
    let referrer: { id: string } | null = null
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
        select: { id: true },
      })
      if (!referrer) return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name, email, password: hashed,
          referredBy: referrer ? referralCode!.toUpperCase() : undefined,
        },
        select: { id: true, name: true, email: true, role: true },
      })

      // Auto-generate referral code for the new user
      const code = generateCode(name, newUser.id)
      await tx.user.update({
        where: { id: newUser.id },
        data: { referralCode: code },
      })

      if (referrer) {
        // Credit new user
        const newWallet = await tx.skinWallet.upsert({
          where: { userId: newUser.id },
          create: { userId: newUser.id, balance: REFERRAL_BONUS },
          update: { balance: { increment: REFERRAL_BONUS } },
        })
        await tx.walletTransaction.create({
          data: {
            walletId: newWallet.id,
            amount: REFERRAL_BONUS,
            type: 'REFERRAL',
            description: `Welcome bonus — joined via referral code`,
          },
        })

        // Credit referrer
        const refWallet = await tx.skinWallet.upsert({
          where: { userId: referrer.id },
          create: { userId: referrer.id, balance: REFERRAL_BONUS },
          update: { balance: { increment: REFERRAL_BONUS } },
        })
        await tx.walletTransaction.create({
          data: {
            walletId: refWallet.id,
            amount: REFERRAL_BONUS,
            type: 'REFERRAL',
            description: `Referral bonus — ${name} joined using your code`,
          },
        })
      }

      return newUser
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
