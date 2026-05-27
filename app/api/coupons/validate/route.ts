import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()
    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), isActive: true } })

    if (!coupon) return NextResponse.json({ valid: false, message: 'Invalid coupon code' })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, message: 'Coupon has expired' })
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' })
    }
    if (subtotal < coupon.minOrder) {
      return NextResponse.json({ valid: false, message: `Minimum order of ₹${coupon.minOrder} required` })
    }

    const discountAmount = coupon.type === 'PERCENTAGE'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)

    return NextResponse.json({
      valid: true,
      discount: coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`,
      discountAmount,
      message: `Coupon applied! You save ₹${discountAmount}`,
    })
  } catch {
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 })
  }
}
