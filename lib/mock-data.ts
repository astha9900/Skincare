export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "vendor" | "customer"
  vendorBrand?: string
}

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviews: number
  image: string
  description: string
  ingredients: string
  howToUse: string
  vendorId?: string
  inStock: boolean
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: { productId: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: "cod" | "upi"
  createdAt: string
}

// Mock Users with three types of credentials
export const MOCK_USERS: User[] = [
  {
    id: "admin-1",
    email: "admin@skincare.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "vendor-1",
    email: "vendor@mamaearth.com",
    password: "vendor123",
    name: "Mamaearth Vendor",
    role: "vendor",
    vendorBrand: "Mamaearth",
  },
  {
    id: "vendor-2",
    email: "vendor@minimalist.com",
    password: "vendor123",
    name: "Minimalist Vendor",
    role: "vendor",
    vendorBrand: "Minimalist",
  },
  {
    id: "customer-1",
    email: "customer@example.com",
    password: "customer123",
    name: "John Doe",
    role: "customer",
  },
]

// Mock Products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Vitamin C Face Wash",
    brand: "Mamaearth",
    category: "Face Care",
    price: 249,
    originalPrice: 299,
    discount: 17,
    rating: 4.5,
    reviews: 2453,
    image: "/mamaearth-vitamin-c-face-wash.jpg",
    description: "A gentle daily cleanser enriched with Vitamin C to brighten and cleanse your skin.",
    ingredients: "Vitamin C, Turmeric, Aloe Vera, Glycerin",
    howToUse: "Wet your face, apply a small amount, massage gently, and rinse with water.",
    vendorId: "vendor-1",
    inStock: true,
  },
  {
    id: "prod-2",
    name: "Salicylic Acid Serum 2%",
    brand: "Minimalist",
    category: "Acne Care",
    price: 599,
    originalPrice: 699,
    discount: 14,
    rating: 4.7,
    reviews: 1876,
    image: "/minimalist-salicylic-acid-serum.jpg",
    description: "Targets acne and blemishes with 2% Salicylic Acid for clearer skin.",
    ingredients: "Salicylic Acid 2%, Hyaluronic Acid, Zinc PCA",
    howToUse: "Apply 2-3 drops on clean skin. Use once daily in the evening.",
    vendorId: "vendor-2",
    inStock: true,
  },
  {
    id: "prod-3",
    name: "Onion Hair Oil",
    brand: "WOW",
    category: "Hair Care",
    price: 499,
    originalPrice: 599,
    discount: 17,
    rating: 4.3,
    reviews: 3421,
    image: "/wow-onion-hair-oil.jpg",
    description: "Enriched with onion seed oil to promote hair growth and reduce hair fall.",
    ingredients: "Onion Seed Oil, Coconut Oil, Almond Oil, Castor Oil",
    howToUse: "Massage onto scalp and hair. Leave for 1-2 hours or overnight, then wash.",
    inStock: true,
  },
  {
    id: "prod-4",
    name: "Green Tea Moisturizer",
    brand: "Plum",
    category: "Face Care",
    price: 470,
    originalPrice: 550,
    discount: 15,
    rating: 4.6,
    reviews: 1654,
    image: "/plum-green-tea-moisturizer.jpg",
    description: "Lightweight gel moisturizer with green tea for oil control and hydration.",
    ingredients: "Green Tea Extract, Glycerin, Mandelic Acid",
    howToUse: "Apply a small amount on cleansed face morning and evening.",
    inStock: true,
  },
  {
    id: "prod-5",
    name: "9 to 5 Vitamin C Sunscreen SPF 50",
    brand: "Lakme",
    category: "Sun Care",
    price: 399,
    originalPrice: 450,
    discount: 11,
    rating: 4.4,
    reviews: 2156,
    image: "/lakme-sunscreen-spf-50.jpg",
    description: "Broad spectrum SPF 50 sunscreen with Vitamin C for sun protection.",
    ingredients: "Vitamin C, Zinc Oxide, Titanium Dioxide",
    howToUse: "Apply generously 15 minutes before sun exposure. Reapply every 2 hours.",
    inStock: true,
  },
]

export const CATEGORIES = [
  { name: "Face Care", image: "/face-care-skincare.jpg", count: 145 },
  { name: "Hair Care", image: "/hair-care-products.png", count: 98 },
  { name: "Body Care", image: "/body-care-lotion.jpg", count: 76 },
  { name: "Anti-Aging", image: "/anti-aging-serum.jpg", count: 54 },
  { name: "Acne Care", image: "/acne-treatment.png", count: 43 },
  { name: "Sun Care", image: "/sunscreen-protection.png", count: 32 },
]

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("products")
  if (!stored) {
    localStorage.setItem("products", JSON.stringify(MOCK_PRODUCTS))
  }
}
