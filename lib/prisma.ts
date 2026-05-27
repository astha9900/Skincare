import { PrismaClient } from '@prisma/client'

function createPrisma(): PrismaClient {
  const connectionString = process.env.POSTGRES_PRISMA_URL

  if (!connectionString) {
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('DATABASE_NOT_CONFIGURED: set POSTGRES_PRISMA_URL in .env')
      },
    })
  }

  // Use Neon serverless adapter (WebSocket) in edge/Vercel runtime
  // Use standard pg adapter in Node.js dev/seed environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEdge = typeof (globalThis as any).EdgeRuntime !== 'undefined' || process.env.NEXT_RUNTIME === 'edge'

  if (isEdge) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('@neondatabase/serverless')
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter, log: ['error'] })
  }

  // Node.js (dev server, API routes in Node runtime)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const g = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = g.prisma ?? createPrisma()
if (process.env.NODE_ENV !== 'production') g.prisma = prisma
