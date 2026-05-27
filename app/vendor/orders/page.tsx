import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-violet-100 text-violet-700', DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function VendorOrdersPage() {
  const session = await auth()
  const user = session?.user as { id?: string }
  if (!user?.id) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { vendorId: user.id } } } },
    include: {
      items: {
        where: { product: { vendorId: user.id } },
        include: { product: { select: { name: true, image: true } } },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <span className="text-sm text-muted-foreground">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const lineTotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0)
            return (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.user.name ?? o.user.email} · {new Date(o.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${STATUS_COLORS[o.status] ?? 'bg-gray-100'}`}>
                        {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                      </Badge>
                      <span className="font-bold">₹{lineTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {o.items.map(item => (
                      <div key={item.id} className="flex-shrink-0 flex gap-2 items-center bg-muted/50 rounded px-2 py-1.5">
                        {item.product.image ? (
                          <Image src={item.product.image} alt={item.productName} width={32} height={32}
                            className="rounded object-cover" />
                        ) : null}
                        <div>
                          <p className="text-xs font-medium line-clamp-1 max-w-[120px]">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantity} · ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
