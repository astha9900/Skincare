import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as { id: string; role?: string }
    const isAdmin = user.role === 'ADMIN'

    const status = req.nextUrl.searchParams.get('status')
    const search = req.nextUrl.searchParams.get('search')
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '20'), 100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = isAdmin ? {} : { userId: user.id }
    if (status && status !== 'ALL') where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ orders })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  paymentMethod: z.enum(['COD', 'UPI', 'CARD']),
  couponCode: z.string().optional(),
  useWallet: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { items, shippingAddress, paymentMethod, couponCode, useWallet } = parsed.data

    // Validate stock
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    })

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      if (!product.inStock || product.stockCount < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }
    }

    let discountAmount = 0
    let validCoupon: { id: string } | null = null

    // Validate coupon
    if (couponCode) {
      const subtotal = items.reduce((sum, item) => {
        const p = products.find((pr) => pr.id === item.productId)!
        return sum + p.price * item.quantity
      }, 0)

      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
      })

      if (coupon) {
        if ((!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
            subtotal >= coupon.minOrder &&
            (!coupon.expiresAt || coupon.expiresAt > new Date())) {
          discountAmount = coupon.type === 'PERCENTAGE'
            ? (subtotal * coupon.value) / 100
            : Math.min(coupon.value, subtotal)
          validCoupon = { id: coupon.id }
        }
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const p = products.find((pr) => pr.id === item.productId)!
      return sum + p.price * item.quantity
    }, 0)

    // Wallet deduction
    let walletDiscount = 0
    let walletId: string | null = null
    if (useWallet) {
      const wallet = await prisma.skinWallet.findUnique({ where: { userId } })
      if (wallet && wallet.balance > 0) {
        const afterCoupon = subtotal - discountAmount
        walletDiscount = Math.min(wallet.balance, afterCoupon)
        walletId = wallet.id
      }
    }

    const shippingCost = subtotal - discountAmount - walletDiscount >= 499 ? 0 : 49
    const total = Math.max(0, subtotal - discountAmount - walletDiscount + shippingCost)

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          subtotal,
          discountAmount,
          couponCode: couponCode ?? null,
          walletDiscount,
          shippingCost,
          total,
          paymentMethod,
          shippingAddress,
          items: {
            create: items.map((item) => {
              const p = products.find((pr) => pr.id === item.productId)!
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: p.price,
                productName: p.name,
                productImage: p.image,
              }
            }),
          },
        },
        include: { items: true },
      })

      // Decrement stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCount: { decrement: item.quantity } },
        })
      }

      // Increment coupon usage
      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      // Deduct wallet balance
      if (walletId && walletDiscount > 0) {
        await tx.skinWallet.update({
          where: { id: walletId },
          data: { balance: { decrement: walletDiscount } },
        })
        await tx.walletTransaction.create({
          data: {
            walletId,
            amount: -walletDiscount,
            type: 'DEBIT',
            description: `Used for order ${newOrder.orderNumber}`,
            orderId: newOrder.id,
          },
        })
      }

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
