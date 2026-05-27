import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { addBusinessDays, format } from 'date-fns'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Order Confirmed' }

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session) notFound()

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order || order.userId !== (session.user as { id: string }).id) notFound()

  const estimatedDelivery = addBusinessDays(new Date(), 5)
  const shippingAddress = order.shippingAddress as { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-green-50/50 dark:from-green-950/20 to-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success animation */}
          <div className="text-center mb-8">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-6 animate-bounce">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">Order Placed!</h1>
            <p className="text-muted-foreground">Thank you for shopping with SkinGlow</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-bold text-lg">{order.orderNumber}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="font-semibold">{format(estimatedDelivery, 'EEEE, d MMM yyyy')}</p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">Items Ordered</h3>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded overflow-hidden bg-muted shrink-0">
                      <Image src={item.productImage || '/placeholder.jpg'} alt={item.productName} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Shipping To</p>
                  <p className="font-medium">{shippingAddress.name}</p>
                  <p className="text-muted-foreground text-xs">{shippingAddress.line1}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Payment</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                  <p className="text-sm font-bold mt-1">Total: ₹{order.total.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href={`/my-orders/${order.id}`} className="flex-1">
              <Button variant="outline" className="w-full"><Package className="mr-2 h-4 w-4" />Track Order</Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white">
                Continue Shopping<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
