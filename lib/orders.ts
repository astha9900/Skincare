"use client"

import type { Order } from "./mock-data"

const ORDERS_KEY = "skincare_orders"

export function getOrders(): Order[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(ORDERS_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function createOrder(order: Omit<Order, "id" | "createdAt">): Order {
  const orders = getOrders()
  const newOrder: Order = {
    ...order,
    id: `order-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  orders.push(newOrder)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

  return newOrder
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = getOrders()
  const order = orders.find((o) => o.id === orderId)

  if (order) {
    order.status = status
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }
}

export function getUserOrders(userId: string): Order[] {
  return getOrders().filter((order) => order.userId === userId)
}
