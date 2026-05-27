import { describe, it, expect, beforeEach } from 'vitest'
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } from '@/lib/cart'

const snapshot = { name: 'Test Serum', image: '/test.jpg', price: 499 }
const snapshot2 = { name: 'Cream', image: '/c.jpg', price: 299 }

beforeEach(() => {
  localStorage.clear()
})

describe('cart utilities', () => {
  it('starts empty', () => {
    expect(getCart()).toEqual([])
  })

  it('adds an item', () => {
    addToCart('p1', 1, snapshot)
    const cart = getCart()
    expect(cart).toHaveLength(1)
    expect(cart[0].productId).toBe('p1')
    expect(cart[0].quantity).toBe(1)
    expect(cart[0].price).toBe(499)
  })

  it('increments quantity when adding same product', () => {
    addToCart('p1', 1, snapshot)
    addToCart('p1', 2, snapshot)
    const cart = getCart()
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(3)
  })

  it('removes an item', () => {
    addToCart('p1', 1, snapshot)
    removeFromCart('p1')
    expect(getCart()).toHaveLength(0)
  })

  it('updates quantity', () => {
    addToCart('p1', 1, snapshot)
    updateCartItemQuantity('p1', 5)
    expect(getCart()[0].quantity).toBe(5)
  })

  it('calculates total from snapshots', () => {
    addToCart('p1', 2, snapshot)
    addToCart('p2', 1, snapshot2)
    expect(getCartTotal()).toBe(499 * 2 + 299)
  })

  it('clears cart', () => {
    addToCart('p1', 3, snapshot)
    clearCart()
    expect(getCart()).toHaveLength(0)
  })
})
