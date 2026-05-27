import 'dotenv/config'
import { PrismaClient, Role, CouponType, OrderStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { seedProducts } from './seed-products'

// Use standard pg for seed (Node.js env, not edge)
const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_PRISMA_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in order
  console.log('Clearing existing seed data...')
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.product.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.user.deleteMany()
  console.log('Existing seed data cleared.')

  // Users
  console.log('Creating users...')
  const [adminPw, vendorPw, customerPw] = await Promise.all([
    bcrypt.hash('admin123', 12),
    bcrypt.hash('vendor123', 12),
    bcrypt.hash('customer123', 12),
  ])

  const admin = await prisma.user.create({
    data: { id: 'admin-1', email: 'admin@skinglow.com', password: adminPw, name: 'Admin User', role: Role.ADMIN },
  })

  const vendor1 = await prisma.user.create({
    data: { id: 'vendor-1', email: 'vendor@mamaearth.com', password: vendorPw, name: 'Mamaearth Vendor', role: Role.VENDOR, vendorBrand: 'Mamaearth' },
  })

  const vendor2 = await prisma.user.create({
    data: { id: 'vendor-2', email: 'vendor@minimalist.com', password: vendorPw, name: 'Minimalist Vendor', role: Role.VENDOR, vendorBrand: 'Minimalist' },
  })

  const customer = await prisma.user.create({
    data: { id: 'customer-1', email: 'customer@example.com', password: customerPw, name: 'Priya Sharma', role: Role.CUSTOMER, phone: '+91-9876543210' },
  })
  console.log('Users created.')

  // Products
  console.log(`Creating ${seedProducts.length} products...`)
  const products = []
  for (const [index, product] of seedProducts.entries()) {
    const baseSlug = `${product.brand}-${product.name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const vendorId = product.brand === vendor1.vendorBrand ? vendor1.id : product.brand === vendor2.vendorBrand ? vendor2.id : null

    products.push(
      await prisma.product.create({
        data: {
          ...product,
          slug: `${baseSlug}-${index}`,
          images: [product.image],
          vendorId,
        },
      }),
    )
    if ((index + 1) % 50 === 0) console.log(`  Created ${index + 1} products...`)
  }

  console.log(`✅ Created ${products.length} products`)

  // Reviews
  await prisma.review.createMany({
    data: [
      { userId: 'customer-1', productId: products[0].id, rating: 5, title: 'Amazing face wash!', body: 'My skin looks so bright after using this for 2 weeks. The Vitamin C really works!', verified: true },
      { userId: 'customer-1', productId: products[1].id, rating: 5, title: 'Best acne serum', body: 'Cleared my acne in 2 weeks. No new breakouts since I started using this.', verified: true },
    ],
  })

  // Address
  await prisma.address.create({
    data: { userId: 'customer-1', name: 'Priya Sharma', phone: '+91-9876543210', line1: '42 MG Road, Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', isDefault: true },
  })

  // Sample orders
  const order1 = await prisma.order.create({
    data: {
      userId: 'customer-1',
      orderNumber: 'ORD-2025-001',
      subtotal: 968,
      total: 968,
      status: OrderStatus.DELIVERED,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      shippingAddress: { name: 'Priya Sharma', phone: '+91-9876543210', line1: '42 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[0].id, quantity: 2, price: 249, productName: products[0].name, productImage: products[0].image },
          { productId: products[3].id, quantity: 1, price: 470, productName: products[3].name, productImage: products[3].image },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      userId: 'customer-1',
      orderNumber: 'ORD-2025-002',
      subtotal: 599,
      couponCode: 'SAVE10',
      discountAmount: 59.9,
      total: 539.1,
      status: OrderStatus.SHIPPED,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      trackingNumber: 'TRK789456123',
      shippingAddress: { name: 'Priya Sharma', phone: '+91-9876543210', line1: '42 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: {
        create: [{ productId: products[1].id, quantity: 1, price: 599, productName: products[1].name, productImage: products[1].image }],
      },
    },
  })

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { code: 'SAVE10', type: CouponType.PERCENTAGE, value: 10, minOrder: 299, maxUses: 1000, isActive: true },
      { code: 'FIRST20', type: CouponType.PERCENTAGE, value: 20, minOrder: 499, maxUses: 500, isActive: true },
      { code: 'FLAT100', type: CouponType.FIXED, value: 100, minOrder: 799, isActive: true },
      { code: 'SKINCARE50', type: CouponType.FIXED, value: 50, minOrder: 399, maxUses: 200, isActive: true },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('Test credentials:')
  console.log('  Admin:    admin@skinglow.com / admin123')
  console.log('  Vendor 1: vendor@mamaearth.com / vendor123')
  console.log('  Vendor 2: vendor@minimalist.com / vendor123')
  console.log('  Customer: customer@example.com / customer123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
