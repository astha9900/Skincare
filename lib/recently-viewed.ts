const KEY = 'skincare_recently_viewed'
const MAX = 8

export interface RecentProduct {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  originalPrice?: number | null
  discount?: number | null
  image: string
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
}

export function trackView(product: RecentProduct) {
  if (typeof window === 'undefined') return
  try {
    const prev = getRecentlyViewed()
    const next = [product, ...prev.filter((p) => p.id !== product.id)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
}

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
