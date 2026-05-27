import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const { id } = await params

    const body = await req.json()
    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }

    const address = await prisma.address.update({ where: { id, userId }, data: body })
    return NextResponse.json(address)
  } catch {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as { id: string }).id
    const { id } = await params

    const count = await prisma.address.count({ where: { userId } })
    if (count <= 1) return NextResponse.json({ error: 'Cannot delete your only address' }, { status: 400 })

    await prisma.address.delete({ where: { id, userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
