"use client"

import type { CartItem } from "./mock-data"

const CART_KEY = "skincare_cart"

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(CART_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addToCart(productId: string, quantity = 1) {
  const cart = getCart()
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const cart = getCart()
  const item = cart.find((item) => item.productId === productId)

  if (item) {
    item.quantity = quantity
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((item) => item.productId !== productId)
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function clearCart() {
  localStorage.removeItem(CART_KEY)
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}
