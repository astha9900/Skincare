import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['RETURN', 'EXCHANGE']),
  reason: z.string().min(10, 'Please describe the reason (min 10 characters)'),
  items: z.array(z.object({ productName: z.string(), quantity: z.number().int().positive() })).min(1),
  exchangeFor: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const { id: orderId } = await params

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.userId !== userId) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'DELIVERED') return NextResponse.json({ error: 'Only delivered orders can be returned or exchanged' }, { status: 400 })

    const existing = await prisma.returnRequest.findUnique({ where: { orderId } })
    if (existing) return NextResponse.json({ error: 'A return/exchange request already exists for this order' }, { status: 400 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const request = await prisma.returnRequest.create({
      data: { orderId, userId, ...parsed.data },
    })
    return NextResponse.json(request, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const { id: orderId } = await params

    const request = await prisma.returnRequest.findUnique({ where: { orderId } })
    if (!request || request.userId !== userId) return NextResponse.json(null)
    return NextResponse.json(request)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
}
