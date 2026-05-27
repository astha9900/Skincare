'use client'

const CART_KEY = 'skincare_cart'

export interface CartItem {
  productId: string
  quantity: number
  name?: string
  image?: string
  price?: number
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[]
  } catch {
    return []
  }
}

export function addToCart(productId: string, quantity = 1, snapshot?: { name: string; image: string; price: number }) {
  const cart = getCart()
  const existing = cart.find((i) => i.productId === productId)
  if (existing) {
    existing.quantity += quantity
    if (snapshot) { existing.name = snapshot.name; existing.image = snapshot.image; existing.price = snapshot.price }
  } else {
    cart.push({ productId, quantity, ...snapshot })
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const cart = getCart()
  const item = cart.find((i) => i.productId === productId)
  if (item) { item.quantity = quantity; localStorage.setItem(CART_KEY, JSON.stringify(cart)) }
}

export function removeFromCart(productId: string) {
  localStorage.setItem(CART_KEY, JSON.stringify(getCart().filter((i) => i.productId !== productId)))
}

export function clearCart() {
  localStorage.removeItem(CART_KEY)
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0)
}

export function getCartTotal(): number {
  return getCart().reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
}
