import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const period = req.nextUrl.searchParams.get('period') ?? '30d'
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const prevFrom = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000)

    const [
      currentRevenue,
      prevRevenue,
      currentOrders,
      prevOrders,
      totalUsers,
      prevUsers,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: from }, status: { not: 'CANCELLED' } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { createdAt: { gte: prevFrom, lt: from }, status: { not: 'CANCELLED' } }, _sum: { total: true }, _count: true }),
      prisma.order.count({ where: { createdAt: { gte: from } } }),
      prisma.order.count({ where: { createdAt: { gte: prevFrom, lt: from } } }),
      prisma.user.count({ where: { createdAt: { gte: from } } }),
      prisma.user.count({ where: { createdAt: { gte: prevFrom, lt: from } } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } } } }),
    ])

    const totalRevenue = currentRevenue._sum.total ?? 0
    const prevTotalRevenue = prevRevenue._sum.total ?? 0
    const revenueGrowth = prevTotalRevenue > 0 ? Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100) : 0
    const ordersGrowth = prevOrders > 0 ? Math.round(((currentOrders - prevOrders) / prevOrders) * 100) : 0
    const usersGrowth = prevUsers > 0 ? Math.round(((totalUsers - prevUsers) / prevUsers) * 100) : 0
    const avgOrderValue = currentRevenue._count > 0 ? Math.round(totalRevenue / currentRevenue._count) : 0

    // Revenue by day
    const allOrders = await prisma.order.findMany({
      where: { createdAt: { gte: from }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, total: true },
    })

    const revenueByDay: Record<string, { revenue: number; orders: number }> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(from)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      revenueByDay[key] = { revenue: 0, orders: 0 }
    }
    for (const o of allOrders) {
      const key = o.createdAt.toISOString().split('T')[0]
      if (revenueByDay[key]) {
        revenueByDay[key].revenue += o.total
        revenueByDay[key].orders++
      }
    }

    // Top products
    const topItemsRaw = await prisma.orderItem.groupBy({
      by: ['productId', 'productName', 'productImage'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const topProducts = topItemsRaw.map((item) => ({
      id: item.productId,
      name: item.productName,
      image: item.productImage,
      unitsSold: item._sum.quantity ?? 0,
      revenue: Math.round((item._sum.price ?? 0) * (item._sum.quantity ?? 0)),
    }))

    // Revenue by category
    const allOrderItems = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: from }, status: { not: 'CANCELLED' } } },
      include: { product: { select: { category: true } } },
    })

    const catRevenue: Record<string, number> = {}
    for (const item of allOrderItems) {
      const cat = item.product.category
      catRevenue[cat] = (catRevenue[cat] ?? 0) + item.price * item.quantity
    }
    const revenueByCategory = Object.entries(catRevenue).map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }))

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue),
      revenueGrowth,
      totalOrders: currentOrders,
      ordersGrowth,
      totalUsers,
      usersGrowth,
      avgOrderValue,
      ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
      revenueByDay: Object.entries(revenueByDay).map(([date, v]) => ({ date, ...v })),
      topProducts,
      revenueByCategory,
      recentOrders,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
