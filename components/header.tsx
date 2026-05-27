'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingCart, User, Menu, Search, Heart, X, ChevronDown, LogOut,
  Package, Settings, BarChart2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { SkinGlowLogo } from '@/components/logo'
import { getCartCount } from '@/lib/cart'

const CATEGORIES = ['Face Care', 'Hair Care', 'Body Care', 'Anti-Aging', 'Acne Care', 'Sun Care']
const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/brands', label: 'Brands' },
  { href: '/skin-guide', label: 'Skin Guide' },
  { href: '/contact', label: 'Contact' },
]
const MORE_LINKS = [
  { href: '/offers', label: 'Offers' },
  { href: '/best-sellers', label: 'Best Sellers' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/faq', label: 'FAQ' },
  { href: '/help-center', label: 'Help Center' },
  { href: '/site-map', label: 'Site Map' },
]

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; brand: string; image: string; price: number; slug: string }>>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const user = session?.user as { id?: string; name?: string; role?: string } | undefined

  useEffect(() => {
    setCartCount(getCartCount())
    const handler = () => setCartCount(getCartCount())
    window.addEventListener('cartUpdated', handler)
    window.addEventListener('storage', handler)
    return () => { window.removeEventListener('cartUpdated', handler); window.removeEventListener('storage', handler) }
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setWishlistCount(data.length))
      .catch(() => {})
  }, [session])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
    }, 300)
  }, [searchQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <SkinGlowLogo size={34} />
            <span className="hidden sm:flex items-baseline gap-0.5 text-xl font-semibold tracking-tight select-none">
              <span className="text-[#1a5436] dark:text-[#5bb87e]">Skin</span>
              <span className="font-bold text-[#2d7a4e] dark:text-[#7ddba5]">Glow</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Categories <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat} asChild>
                    <Link href={`/products?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                More <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {MORE_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-xs relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search products…"
                  className="pl-9 pr-4"
                />
              </div>
            </form>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <img src={p.image || '/placeholder.jpg'} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand} · ₹{p.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => router.push('/search')}>
              <Search className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            {session && (
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-accent text-xs font-bold text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User menu">
                    <div className="h-7 w-7 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-semibold">
                      {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-semibold">{user?.name}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/my-orders"><Package className="mr-2 h-4 w-4" />My Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/wishlist"><Heart className="mr-2 h-4 w-4" />Wishlist</Link></DropdownMenuItem>
                  {user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/admin"><BarChart2 className="mr-2 h-4 w-4" />Admin Panel</Link></DropdownMenuItem>
                    </>
                  )}
                  {user?.role === 'VENDOR' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/vendor"><Settings className="mr-2 h-4 w-4" />Vendor Panel</Link></DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-2 mb-2">
                    <SkinGlowLogo size={28} />
                    <span className="font-bold text-lg tracking-tight">
                      <span className="text-[#1a5436] dark:text-[#5bb87e]">Skin</span>
                      <span className="text-[#2d7a4e] dark:text-[#7ddba5]">Glow</span>
                    </span>
                  </Link>
                  <SheetClose asChild><Link href="/" className="text-lg font-medium">Home</Link></SheetClose>
                  <SheetClose asChild><Link href="/products" className="text-lg font-medium">All Products</Link></SheetClose>
                  {NAV_LINKS.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link href={link.href} className="text-lg font-medium">{link.label}</Link>
                    </SheetClose>
                  ))}
                  {MORE_LINKS.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link href={link.href} className="text-sm text-muted-foreground pl-4">{link.label}</Link>
                    </SheetClose>
                  ))}
                  {CATEGORIES.map((cat) => (
                    <SheetClose key={cat} asChild>
                      <Link href={`/products?category=${encodeURIComponent(cat)}`} className="text-sm text-muted-foreground pl-4">
                        {cat}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="border-t pt-4">
                    {session ? (
                      <>
                        <SheetClose asChild><Link href="/profile" className="block py-1 text-sm">Profile</Link></SheetClose>
                        <SheetClose asChild><Link href="/my-orders" className="block py-1 text-sm">My Orders</Link></SheetClose>
                        <SheetClose asChild><Link href="/wishlist" className="block py-1 text-sm">Wishlist</Link></SheetClose>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="block py-1 text-sm text-destructive">Sign Out</button>
                      </>
                    ) : (
                      <SheetClose asChild><Link href="/login" className="block py-1 text-sm">Login / Sign Up</Link></SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
