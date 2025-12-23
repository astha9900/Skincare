"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getOrders, updateOrderStatus } from "@/lib/orders"
import { MOCK_PRODUCTS, type Order } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AdminOrdersPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)
    setOrders(getOrders())
  }, [router])

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus)
    setOrders(getOrders())
    toast({
      title: "Order updated",
      description: "Order status has been updated successfully",
    })
  }

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

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Order Management</h1>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                            {product?.brand} - Qty: {item.quantity} x ₹{item.price}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Shipping Address</p>
                    <p className="text-sm">{order.shippingAddress.name}</p>
                    <p className="text-sm">{order.shippingAddress.phone}</p>
                    <p className="text-sm">{order.shippingAddress.address}</p>
                    <p className="text-sm">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">{order.paymentMethod.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground mt-2">Total Amount</p>
                    <p className="text-2xl font-bold">₹{order.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
