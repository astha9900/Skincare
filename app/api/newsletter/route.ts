import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const parsed = z.string().email().safeParse(email)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

    await prisma.$executeRaw`
      INSERT INTO "NewsletterSubscriber" (id, email, "createdAt")
      VALUES (gen_random_uuid()::text, ${parsed.data}, NOW())
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
