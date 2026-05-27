import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Package, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SHIPPED: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  REFUNDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

export const metadata = { title: 'My Orders' }

export default async function MyOrdersPage() {
  const session = await auth()
  if (!session) redirect('/login?redirect=/my-orders')

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as { id: string }).id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-20 w-20 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
              <Link href="/products"><Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">Start Shopping</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{format(order.createdAt, 'd MMM yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={STATUS_BADGE[order.status] ?? ''}>{order.status}</Badge>
                        <span className="font-bold">₹{order.total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-muted">
                          <Image src={item.productImage || '/placeholder.jpg'} alt={item.productName} fill className="object-cover" sizes="64px" />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-16 shrink-0 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-2">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {order.paymentMethod}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <Link href={`/my-orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details<ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      {order.trackingNumber && (
                        <Button variant="outline" size="sm">
                          Track: {order.trackingNumber}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
