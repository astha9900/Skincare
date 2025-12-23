"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserOrders } from "@/lib/orders"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { getCurrentUser, isAuthenticated } from "@/lib/auth"
import type { Order } from "@/lib/mock-data"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login?redirect=/my-orders")
      return
    }

    const user = getCurrentUser()
    if (user) {
      setOrders(getUserOrders(user.id))
    }
  }, [router])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">No orders yet</h2>
            <p className="text-muted-foreground">Start shopping to see your orders here!</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => {
                      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId)
                      return (
                        <div key={item.productId} className="flex gap-4">
                          <img
                            src={product?.image || "/placeholder.svg"}
                            alt={product?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} x ₹{item.price}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Shipping Address</p>
                        <p className="text-sm">{order.shippingAddress.name}</p>
                        <p className="text-sm">{order.shippingAddress.address}</p>
                        <p className="text-sm">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">₹{order.total}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
