# 🧴 Skincare — Full-Stack E-Commerce Platform

A modern, full-featured skincare e-commerce platform with product browsing, user authentication, cart management, wishlists, admin dashboard, and secure checkout. Built with Next.js 16, Prisma, and PostgreSQL.

## ✨ Features

### Shopper Experience
- **Product Catalog** — Browse skincare products with filters by category, price, tags, and ratings
- **Product Detail Pages** — Image galleries, ingredients, reviews, and related products
- **Shopping Cart** — Add, remove, update quantities with real-time subtotal
- **Wishlist** — Save favourite products for later
- **User Authentication** — Sign up / login with NextAuth.js (credentials + OAuth)
- **Order Tracking** — View order history and current order status
- **Pagination** — Smooth browsing across large product catalogs

### Admin Dashboard
- **Product Management** — Create, edit, delete products with image uploads
- **Order Management** — View and update order status
- **User Management** — View registered users and roles
- **Analytics** — Sales overview with charts

## 🛠️ Tech Stack

**Frontend**
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**Backend & Database**
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=flat-square&logo=next.js&logoColor=white)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI, shadcn/ui |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma |
| Auth | NextAuth.js v5 with Prisma adapter |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Deployment | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/astha9900/Skincare.git
cd Skincare

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, etc.

# Run database migrations & generate Prisma client
npx prisma migrate dev
npx prisma db seed     # Optional: seed with sample products

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Skincare/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login / register pages
│   ├── (shop)/             # Product listing & detail pages
│   ├── admin/              # Admin dashboard (protected)
│   ├── api/                # API route handlers
│   └── cart/               # Cart & checkout flow
│
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui base components
│   ├── product/            # Product cards, galleries, filters
│   ├── cart/               # Cart drawer, item components
│   └── admin/              # Admin-specific components
│
├── lib/                    # Utilities, helpers, Prisma client
├── hooks/                  # Custom React hooks
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── seed.ts             # Sample data seeder
└── styles/                 # Global styles
```

## 🔒 Authentication

- NextAuth.js v5 with Prisma adapter
- Credentials provider (email + password with bcrypt)
- Role-based access: `USER` and `ADMIN`
- Admin routes protected via middleware

## 📄 License

MIT © [Astha Bharti](https://github.com/astha9900)
