# SkinGlow — Full-Stack Skincare E-Commerce

A production-grade skincare e-commerce platform built with Next.js 16 App Router, Prisma, PostgreSQL, and NextAuth.js v5.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Vercel Postgres (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (JWT + Credentials) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Tests | Vitest + Testing Library |
| Deployment | Vercel |

## Features

- **Multi-role auth** — Admin, Vendor, Customer with middleware-based route protection
- **Product catalog** — Filter by category/brand/price, sort, grid/list view, URL-based state
- **Product detail** — Image gallery, reviews, rating breakdown, related products
- **Cart** — localStorage-based with snapshot (no roundtrip), coupon apply, shipping progress
- **Checkout** — Saved addresses, Indian states dropdown, COD/UPI/CARD payment
- **Order tracking** — Timeline stepper, status badges, cancel with stock restore
- **Admin dashboard** — KPI cards, Recharts charts (revenue/orders/status/top products), period toggle
- **Admin management** — Products CRUD, Orders status update + CSV export, User role/ban, Coupons CRUD
- **Vendor dashboard** — Scoped KPIs, product management, orders, earnings bar chart
- **Newsletter** — Email subscription with upsert
- **Dark mode** — next-themes with ThemeToggle

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Vercel Postgres / Neon free tier)

### Environment Variables

Create a `.env` file:

```env
POSTGRES_PRISMA_URL="postgresql://..."       # pooled connection for Prisma
POSTGRES_URL_NON_POOLING="postgresql://..."  # direct connection for migrations
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Setup

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@skinglow.com | admin123 |
| Vendor | vendor@mamaearth.com | vendor123 |
| Vendor | vendor@minimalist.com | vendor123 |
| Customer | customer@example.com | customer123 |

## Project Structure

```
app/
  (store)/          # Customer-facing pages
  admin/            # Admin dashboard + management pages
  vendor/           # Vendor dashboard
  api/              # API routes (products, orders, users, coupons, auth, wishlist)
components/         # Shared UI components
lib/                # Prisma client, cart utilities, auth helpers
prisma/             # Schema + seed data
tests/              # Vitest unit tests
```

## Running Tests

```bash
npm run test:run    # single run
npm test            # watch mode
```

## Deploying to Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard (same as `.env`)
3. Vercel auto-runs `prisma generate && next build` on deploy
4. Run seed once: `npx prisma db seed`
