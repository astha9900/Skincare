import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().length(6),
  isDefault: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } })
    return NextResponse.json(addresses)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id

    const body = await req.json()
    const parsed = addressSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const count = await prisma.address.count({ where: { userId } })
    if (count >= 5) return NextResponse.json({ error: 'Maximum 5 addresses allowed' }, { status: 400 })

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }

    const address = await prisma.address.create({ data: { userId, ...parsed.data } })
    return NextResponse.json(address, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}
