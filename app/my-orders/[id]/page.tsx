import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceButton } from './invoice-button'
import { ReturnExchangeDialog } from './return-exchange-dialog'
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

interface Props { params: Promise<{ id: string }> }

const STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-violet-100 text-violet-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-orange-100 text-orange-800',
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  const userId = (session.user as { id: string }).id
  if (!order || order.userId !== userId) notFound()

  const addr = order.shippingAddress as { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string }
  const currentStepIdx = STEPS.indexOf(order.status as typeof STEPS[number])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link href="/my-orders">
            <Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />My Orders</Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">Placed on {format(order.createdAt, 'd MMM yyyy, h:mm a')}</p>
            </div>
            <Badge className={STATUS_BADGE[order.status]}>{order.status}</Badge>
          </div>

          {/* Timeline */}
          {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Order Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {STEPS.map((step, i) => {
                    const done = i <= currentStepIdx
                    const active = i === currentStepIdx
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`flex flex-col items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${done ? 'bg-green-500' : 'bg-muted'}`}>
                            {done ? <CheckCircle className="h-5 w-5 text-white" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <p className={`text-xs mt-1 text-center ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{step}</p>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIdx ? 'bg-green-500' : 'bg-muted'}`} />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Items Ordered</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                    <Image src={item.productImage || '/placeholder.jpg'} alt={item.productName} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal.toFixed(0)}</span></div>
                {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({order.couponCode})</span><span>−₹{order.discountAmount.toFixed(0)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{order.total.toFixed(0)}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Address + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Delivery Address</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{addr.name}</p>
                <p className="text-muted-foreground">{addr.phone}</p>
                <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Payment</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{order.paymentMethod}</p>
                <p className="text-muted-foreground capitalize">{order.paymentStatus.toLowerCase()}</p>
                {order.trackingNumber && <p className="mt-2">Tracking: <span className="font-mono text-xs">{order.trackingNumber}</span></p>}
              </CardContent>
            </Card>
          </div>

          {order.status === 'DELIVERED' && (
            <div className="mb-4">
              <ReturnExchangeDialog items={order.items.map(i => ({ id: i.id, productName: i.productName, quantity: i.quantity }))} />
            </div>
          )}

          <InvoiceButton />
        </div>
      </main>
      <Footer />
    </div>
  )
}
